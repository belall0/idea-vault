import type { QueryClient } from "@tanstack/react-query";
import type { AuthContextValue } from "@/types/auth";

export type RouterContext = {
  queryClient: QueryClient;
  auth: AuthContextValue;
};
