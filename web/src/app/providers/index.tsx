import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/shared/config/query-client";
import { AuthProvider } from "@/features/auth/auth-context";
import { TooltipProvider } from "@/shared/ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>{children}</AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
