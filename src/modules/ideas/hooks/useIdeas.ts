import { useSuspenseQuery } from "@tanstack/react-query";
import { ideasQueryOptions } from "../ideas.queries";

export function useIdeas() {
  return useSuspenseQuery(ideasQueryOptions());
}
