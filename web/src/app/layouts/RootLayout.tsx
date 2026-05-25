import { HeadContent } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/auth-context";
import { Toaster } from "@/shared/ui/sonner";
import AuthenticatedLayout from "@/app/layouts/AuthenticatedLayout";
import GuestLayout from "@/app/layouts/GuestLayout";

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
