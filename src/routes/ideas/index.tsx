import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ideas/")({
  head: () => ({
    meta: [{ title: "Idea Vault — Browse Ideas" }],
  }),
  component: IdeasPage,
});

function IdeasPage() {
  return <div>IdeasPage</div>;
}
