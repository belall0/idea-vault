import { createFileRoute } from "@tanstack/react-router";

const fetchIdea = async (ideaId: string) => {
  const res = await fetch(`/api/ideas/${ideaId}`);
  if (!res.ok) throw new Error("Failed to fetch Data");
  const idea = await res.json();
  return idea;
};

export const Route = createFileRoute("/ideas/$ideaid/")({
  component: IdeaDetailsPage,
  loader: async ({ params }) => {
    return fetchIdea(params.ideaid);
  },
});

function IdeaDetailsPage() {
  const idea = Route.useLoaderData();

  return <div>{idea.title}</div>;
}
