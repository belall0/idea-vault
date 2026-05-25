import { createFileRoute } from "@tanstack/react-router";
import CreateIdeaPage from "@/pages/CreateIdeaPage";

export const Route = createFileRoute("/_authenticated/ideas/new")({
  head: () => ({
    meta: [{ title: "Create New Idea" }],
  }),
  component: CreateIdeaPage,
});
