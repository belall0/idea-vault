import type { QueryClient } from "@tanstack/react-query";
import type { AuthContextValue } from "@/features/auth/auth-types";

export type RouterContext = {
  queryClient: QueryClient;
  auth: AuthContextValue;
};
