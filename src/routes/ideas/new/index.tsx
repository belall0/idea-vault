import { createFileRoute } from "@tanstack/react-router";
import { NewIdeaPage } from "@/modules/ideas";

export const Route = createFileRoute("/ideas/new/")({
  component: NewIdeaPage,
});
