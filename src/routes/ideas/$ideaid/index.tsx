import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/queries/ideas";

export const Route = createFileRoute("/ideas/$ideaid/")({
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(
      ideaDetailQueryOptions(params.ideaid),
    );
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title }],
  }),
  component: IdeaDetailsPage,
});

export function IdeaDetailsPage() {
  const { ideaid } = Route.useParams();
  const { data: idea } = useSuspenseQuery(ideaDetailQueryOptions(ideaid));

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
