import { createFileRoute } from "@tanstack/react-router";
import { ideasQueryOptions } from "@/modules/ideas";
import HomePage from "@/pages/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(ideasQueryOptions());
  },
});
