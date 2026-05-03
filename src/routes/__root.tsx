import { createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import RootLayout from "@/components/layout/RootLayout";
import NotFoundPage from "@/pages/NotFoundPage";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        title: "Idea Vault — Your Idea Hub",
      },
      {
        name: "description",
        content: "Share, explore and build ",
      },
    ],
  }),
  component: RootLayout,
  notFoundComponent: () => <NotFoundPage />,
});
