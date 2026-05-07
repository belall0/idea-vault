import { createRootRouteWithContext } from "@tanstack/react-router";
import RootLayout from "@/components/RootLayout";
import type { RouterContext } from "@/types/router-context";

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: "Your Idea Hub",
      },
      {
        name: "description",
        content: "Share, explore and build ",
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: () => <p>Page not found</p>,
});
