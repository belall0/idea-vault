import { Outlet, HeadContent } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "@/components/layout/Header";

export default function RootLayout() {
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
