import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/modules/ideas";

export const Route = createFileRoute("/ideas/$ideaid/")({
  component: IdeaDetailsPage,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(ideaDetailQueryOptions(params.ideaid));
  },
});

function IdeaDetailsPage() {
  const { data: idea } = useSuspenseQuery(
    ideaDetailQueryOptions(Route.useParams().ideaid),
  );

  return (
    <div className="p-4">
      <Link to="/ideas" className="black m-4 text-blue-500 underline">
        Back to Ideas
      </Link>
      <h2 className="text-2xl font-bold">{idea.title}</h2>
      <p className="mt-2">{idea.description}</p>
    </div>
  );
}
