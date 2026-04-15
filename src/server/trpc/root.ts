import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  // Candidates add routers here, e.g.:
  //   serviceRequests: serviceRequestsRouter,
});

export type AppRouter = typeof appRouter;
