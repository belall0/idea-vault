import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/queries/ideas";
import EditIdeaForm from "@/components/EditIdeaForm";

export const Route = createFileRoute("/ideas/$ideaid/edit")({
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(
      ideaDetailQueryOptions(params.ideaid),
    );
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Edit ${loaderData?.title}` }],
  }),
  component: EditIdeaPage,
});

function EditIdeaPage() {
  const { ideaid } = Route.useParams();
  const { data: idea } = useSuspenseQuery(ideaDetailQueryOptions(ideaid));

  return (
    <div className="flex justify-center p-4">
      <EditIdeaForm idea={idea} />
    </div>
  );
}
