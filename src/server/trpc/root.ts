import { createTRPCRouter } from "./trpc";
import { serviceRequestsRouter } from "./routers/service-requests";

export const appRouter = createTRPCRouter({
  serviceRequests: serviceRequestsRouter,
});

export type AppRouter = typeof appRouter;