import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { queryClient } from "@/lib/query-client";
import type { AuthContextValue } from "@/types/auth";

export const router = createRouter({
  routeTree,
  context: { queryClient, auth: undefined! as AuthContextValue },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
