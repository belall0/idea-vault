import IdeaForm from "@/components/IdeaForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ideas/new/")({
  head: () => ({
    meta: [{ title: "Create New Idea" }],
  }),
  component: IdeaForm,
});
