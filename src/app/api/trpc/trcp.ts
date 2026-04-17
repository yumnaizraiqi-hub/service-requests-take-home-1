import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const createTRPCContext = async () => {
  const session = await auth();

  return {
    db,
    session,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,

  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Ensures user is authenticated before accessing protected routes.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const user = ctx.session?.user;

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
        user,
      },
    },
  });
});

/**
 * Admin-only access control
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});

/**
 * Customer-only access control
 */
export const customerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "customer") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});