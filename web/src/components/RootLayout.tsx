import { Outlet, HeadContent } from "@tanstack/react-router";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:px-6">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

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

function RootLayout() {
  const { user } = useAuth();

  return (
    <>
      <HeadContent />
      {user ? <AuthenticatedLayout /> : <GuestLayout />}
      <Toaster />
    </>
  );
}

export default RootLayout;
