import { Outlet } from "@tanstack/react-router";
import Header from "@/app/components/Header";

function GuestLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default GuestLayout;
