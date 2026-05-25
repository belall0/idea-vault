import { createFileRoute } from "@tanstack/react-router";
import CreateIdeaPage from "@/pages/CreateIdeaPage";

export const Route = createFileRoute("/ideas/new/")({
  head: () => ({
    meta: [{ title: "Create New Idea" }],
  }),
  component: CreateIdeaPage,
});
