import {
  HeadContent,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient } from "@tanstack/react-query";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
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
  component: () => (
    <>
      <HeadContent />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
