// TODO: learn about react suspense and error boundaries
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { Idea } from "../../../types";
import axiosApi from "../../../lib/axios";

const fetchIdea = async (ideaId: string): Promise<Idea> => {
  const { data } = await axiosApi.get(`/ideas/${ideaId}`);
  return data;
};

const ideaQueryOptions = (ideaId: string) => {
  return queryOptions({
    queryKey: ["ideas", ideaId],
    queryFn: async () => fetchIdea(ideaId),
  });
};

export const Route = createFileRoute("/ideas/$ideaid/")({
  component: IdeaDetailsPage,
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData(ideaQueryOptions(params.ideaid));
  },
});

function IdeaDetailsPage() {
  const { data: idea } = useSuspenseQuery(
    ideaQueryOptions(Route.useParams().ideaid),
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
