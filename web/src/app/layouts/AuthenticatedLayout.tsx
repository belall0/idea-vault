import { Outlet } from "@tanstack/react-router";

import AppSidebar from "@/app/components/AppSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/shared/ui/sidebar";

export default function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* Content Wrapper */}
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:px-6">
          <SidebarTrigger />
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
