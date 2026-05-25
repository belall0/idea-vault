import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { BeatLoader } from "react-spinners";

import { router } from "@/app/router";
import { useAuth } from "@/features/auth/auth-context";
import Providers from "@/app/providers";
import "@/app/index.css";

function InnerApp() {
  const auth = useAuth();

  useEffect(() => {
    router.invalidate();
  }, [auth.user, auth.accessToken]);

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BeatLoader color="var(--primary)" />
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}

createRoot(document.getElementById("root")!).render(
  <Providers>
    <InnerApp />
  </Providers>,
);
