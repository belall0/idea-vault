import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/queries/ideas";
import EditIdeaForm from "@/components/EditIdeaForm";

export const Route = createFileRoute("/ideas/$ideaid/edit")({
  beforeLoad: async ({ params, context }) => {
    const idea = await context.queryClient.ensureQueryData(
      ideaDetailQueryOptions(params.ideaid),
    );

    if (!context.auth.user || context.auth.user.id !== idea.userId) {
      throw redirect({
        to: "/ideas/$ideaid",
        params: { ideaid: params.ideaid },
      });
    }
  },
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
