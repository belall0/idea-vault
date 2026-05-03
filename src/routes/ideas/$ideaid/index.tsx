import { createFileRoute } from "@tanstack/react-router";
import { IdeaDetailsPage, ideaDetailQueryOptions } from "@/modules/ideas";

export const Route = createFileRoute("/ideas/$ideaid/")({
  component: IdeaDetailsPage,

  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(ideaDetailQueryOptions(params.ideaid));
  },
});
