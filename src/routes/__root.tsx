import {
  HeadContent,
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient } from "@tanstack/react-query";
import Header from "./../components/Header";

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
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <HeadContent />
      <Header />
      <main className="flex justify-center p-6">
        <div className="rounted-2xl w-full max-w-4xl bg-white p-8 shadow-lg">
          <Outlet />
        </div>
      </main>
      <TanStackRouterDevtools />
    </div>
  );
}
