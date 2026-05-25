import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    if (!context.auth) return;
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
