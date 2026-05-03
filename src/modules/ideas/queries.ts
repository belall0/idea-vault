import { queryOptions } from "@tanstack/react-query";
import { getIdeas, getIdea } from "./api";

// --- Structured Query Keys ---
export const ideaKeys = {
  all: ["ideas"] as const,
  detail: (id: string) => ["ideas", id] as const,
};

// --- Query Options ---
export const ideasQueryOptions = () =>
  queryOptions({
    queryKey: ideaKeys.all,
    queryFn: getIdeas,
    staleTime: 1000 * 60 * 2, // 2 min
  });

export const ideaDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ideaKeys.detail(id),
    queryFn: () => getIdea(id),
    staleTime: 1000 * 60 * 5, // 5 min
  });
