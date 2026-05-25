import { Outlet } from "@tanstack/react-router";

import Header from "@/app/components/Header";

export default function GuestLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
