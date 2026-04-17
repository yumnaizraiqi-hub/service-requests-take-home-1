import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

/* =========================
   ENUMS
========================= */

export const userRole = pgEnum("user_role", ["customer", "admin"]);

export const requestTypeEnum = pgEnum("request_type", [
  "outage",
  "billing",
  "start_service",
  "stop_service",
  "other",
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const statusEnum = pgEnum("status", [
  "submitted",
  "in_progress",
  "resolved",
  "rejected",
  "closed",
]);

export const visibilityEnum = pgEnum("visibility", ["public", "internal"]);

/* =========================
   DERIVED TYPES
   Single source of truth — never redefine these manually
========================= */

export type RequestType = (typeof requestTypeEnum.enumValues)[number];
export type Priority = (typeof priorityEnum.enumValues)[number];
export type Status = (typeof statusEnum.enumValues)[number];
export type Visibility = (typeof visibilityEnum.enumValues)[number];

/* =========================
   USERS TABLE
========================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* =========================
   SERVICE REQUESTS TABLE
========================= */

export const serviceRequests = pgTable(
  "service_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(), // human-readable e.g. SR-0042
    customerId: uuid("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: requestTypeEnum("type").notNull(),
    priority: priorityEnum("priority").notNull(),
    status: statusEnum("status").notNull().default("submitted"),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    customerIdx: index("service_requests_customer_id_idx").on(table.customerId),
    statusIdx: index("service_requests_status_idx").on(table.status),
  })
);

/* =========================
   SERVICE REQUEST EVENTS TABLE
   Append-only audit log — never update or delete rows
========================= */

export const serviceRequestEvents = pgTable("service_request_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").notNull().references(() => serviceRequests.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  fromStatus: statusEnum("from_status"),         // null on first creation event
  toStatus: statusEnum("to_status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* =========================
   SERVICE REQUEST COMMENTS TABLE
   Public comments + internal admin notes in one table.
   Always filter visibility = 'public' in customer-facing queries.
========================= */

export const serviceRequestComments = pgTable("service_request_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id").notNull().references(() => serviceRequests.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  visibility: visibilityEnum("visibility").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});