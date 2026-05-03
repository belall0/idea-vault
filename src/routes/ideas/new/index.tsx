import { createFileRoute } from "@tanstack/react-router";
import { IdeaForm } from "@/modules/ideas";

export const Route = createFileRoute("/ideas/new/")({
  component: NewIdeaPage,
});

function NewIdeaPage() {
  return <IdeaForm />;
}
