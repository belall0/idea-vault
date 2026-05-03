import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdea } from "../ideas.api";
import { ideaKeys } from "../ideas.queries";

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      // Invalidate the list cache so it refetches in the background
      queryClient.invalidateQueries({ queryKey: ideaKeys.all });
    },
  });
}
