import { Outlet } from "@tanstack/react-router";

import GuestHeader from "@/app/components/GuestHeader";

export default function GuestLayout() {
  return (
    <>
      <GuestHeader />
      <Outlet />
    </>
  );
}
