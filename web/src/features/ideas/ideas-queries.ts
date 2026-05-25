import { queryOptions } from "@tanstack/react-query";
import { getIdea, getIdeas } from "@/features/ideas/ideas-api";

export const ideasQueryOptions = queryOptions({
  queryKey: ["ideas"],
  queryFn: getIdeas,
});

export const ideaDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["ideas", id],
    queryFn: () => getIdea(id),
  });
