import { createFileRoute } from "@tanstack/react-router";
import { ideasQueryOptions, IdeasPage } from "@/modules/ideas";

export const Route = createFileRoute("/ideas/")({
  head: () => ({
    meta: [{ title: "Idea Vault — Browse Ideas" }],
  }),

  component: IdeasPage,

  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(ideasQueryOptions());
  },
});
