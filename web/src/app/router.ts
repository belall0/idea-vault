import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { queryClient } from "@/shared/config/query-client";
import type { AuthContextValue } from "@/features/auth/auth-types";

export const router = createRouter({
  routeTree,
  context: { queryClient, auth: undefined! as AuthContextValue },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
