import { z } from "zod";
import { eq, and, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, customerProcedure, adminProcedure } from "../trpc";
import { serviceRequests, serviceRequestEvents, serviceRequestComments } from "~/server/db/schema";
import { canTransition } from "~/lib/transitions";
import { generateReference } from "~/lib/reference";

// ─── Shared Zod Schemas ────────────────────────────────────────────────────

const requestTypeSchema = z.enum(["outage", "billing", "start_service", "stop_service", "other"]);
const prioritySchema = z.enum(["low", "medium", "high"]);
const statusSchema = z.enum(["submitted", "in_progress", "resolved", "rejected", "closed"]);

// ─── Router ───────────────────────────────────────────────────────────────

export const serviceRequestsRouter = createTRPCRouter({

  /** Customer: submit a new service request */
  create: customerProcedure
    .input(z.object({
      type: requestTypeSchema,
      priority: prioritySchema,
      description: z.string().min(10).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const customerId = ctx.session.user.id;

      const [created] = await ctx.db
        .insert(serviceRequests)
        .values({
          reference: generateReference(),
          customerId,
          type: input.type,
          priority: input.priority,
          description: input.description,
          status: "submitted",
        })
        .returning();

      if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Record the creation event
      await ctx.db.insert(serviceRequestEvents).values({
        requestId: created.id,
        actorId: customerId,
        fromStatus: null,
        toStatus: "submitted",
      });

      return created;
    }),

  /** Customer: list their own requests, newest first */
  listMine: customerProcedure
    .query(async ({ ctx }) => {
      return ctx.db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.customerId, ctx.session.user.id))
        .orderBy(desc(serviceRequests.createdAt));
    }),

  /** Customer: get a single owned request with public comments only */
  getMine: customerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.db.query.serviceRequests.findFirst({
        where: eq(serviceRequests.id, input.id),
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (request.customerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const comments = await ctx.db
        .select()
        .from(serviceRequestComments)
        .where(
          and(
            eq(serviceRequestComments.requestId, input.id),
            eq(serviceRequestComments.visibility, "public")
          )
        );

      return { ...request, comments };
    }),

  /** Admin: list all requests with optional filters */
  listAll: adminProcedure
    .input(z.object({
      status: statusSchema.optional(),
      priority: prioritySchema.optional(),
      sort: z.enum(["asc", "desc"]).default("desc"),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.status) conditions.push(eq(serviceRequests.status, input.status));
      if (input?.priority) conditions.push(eq(serviceRequests.priority, input.priority));

      const sort = input?.sort ?? "desc";
      return ctx.db
        .select()
        .from(serviceRequests)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(sort === "desc" ? desc(serviceRequests.createdAt) : asc(serviceRequests.createdAt));
    }),

  /** Admin: get full request detail including internal comments */
  getOne: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.db.query.serviceRequests.findFirst({
        where: eq(serviceRequests.id, input.id),
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const comments = await ctx.db
        .select()
        .from(serviceRequestComments)
        .where(eq(serviceRequestComments.requestId, input.id));

      const events = await ctx.db
        .select()
        .from(serviceRequestEvents)
        .where(eq(serviceRequestEvents.requestId, input.id));

      return { ...request, comments, events };
    }),

  /** Admin: transition request status with validation */
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: statusSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("updateStatus called with:", { 
        id: input.id, 
        idType: typeof input.id,
        idLength: input.id.length,
        idValue: JSON.stringify(input.id),
        status: input.status 
      });
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(input.id)) {
        console.error("Invalid UUID format:", input.id);
        throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid UUID format: ${input.id}` });
      }
      
      const request = await ctx.db.query.serviceRequests.findFirst({
        where: eq(serviceRequests.id, input.id),
      });

      if (!request) {
        console.error("Request not found:", input.id);
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      console.log("Current status:", request.status, "New status:", input.status);
      if (!canTransition(request.status, input.status)) {
        console.error("Transition failed");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition from "${request.status}" to "${input.status}"`,
        });
      }

      try {
        const [updated] = await ctx.db
          .update(serviceRequests)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(serviceRequests.id, input.id))
          .returning();

        if (!updated) {
          console.error("Update returned null");
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        console.log("Inserting event with actorId:", ctx.session.user.id);
        await ctx.db.insert(serviceRequestEvents).values({
          requestId: input.id,
          actorId: ctx.session.user.id,
          fromStatus: request.status,
          toStatus: input.status,
        });

        console.log("updateStatus succeeded");
        return updated;
      } catch (err) {
        console.error("Database error during updateStatus:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: err });
      }
    }),

  /** Admin: post a public or internal comment */
  addComment: adminProcedure
    .input(z.object({
      requestId: z.string().uuid(),
      body: z.string().min(1).max(5000),
      visibility: z.enum(["public", "internal"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.query.serviceRequests.findFirst({
        where: eq(serviceRequests.id, input.requestId),
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [comment] = await ctx.db
        .insert(serviceRequestComments)
        .values({
          requestId: input.requestId,
          authorId: ctx.session.user.id,
          body: input.body,
          visibility: input.visibility,
        })
        .returning();

      return comment;
    }),
});