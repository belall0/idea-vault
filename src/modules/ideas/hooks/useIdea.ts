import { useSuspenseQuery } from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "../ideas.queries";

export function useIdea(id: string) {
  return useSuspenseQuery(ideaDetailQueryOptions(id));
}
