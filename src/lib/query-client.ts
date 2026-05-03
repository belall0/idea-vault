import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 min global default
        gcTime: 1000 * 60 * 5, // 5 min GC (default, explicit for clarity)
        retry: 1, // 1 retry on failure (not 3)
        refetchOnWindowFocus: false, // Avoid unexpected refetches during dev
      },
      mutations: {
        retry: 0, // Never retry mutations
      },
    },
  });
}

export const queryClient = createQueryClient();
