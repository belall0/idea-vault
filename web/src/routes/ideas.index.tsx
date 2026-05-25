import { createFileRoute } from "@tanstack/react-router";
import { ideasQueryOptions } from "@/features/ideas/ideas-queries";
import IdeasListPage from "@/pages/IdeasListPage";

export const Route = createFileRoute("/ideas/")({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(ideasQueryOptions);
  },
  head: () => ({
    meta: [{ title: "Browse Ideas" }],
  }),
  component: IdeasListPage,
});
