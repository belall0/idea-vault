import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BeatLoader } from "react-spinners";

import { queryClient } from "@/lib/query-client";
import { router } from "@/router";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import "@/index.css";

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
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
