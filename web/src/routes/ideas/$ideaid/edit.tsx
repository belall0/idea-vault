import { createFileRoute, redirect } from "@tanstack/react-router";
import { ideaDetailQueryOptions } from "@/features/ideas/ideas-queries";
import EditIdeaPage from "@/pages/EditIdeaPage";

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
  component: EditIdeaPageWrapper,
});

function EditIdeaPageWrapper() {
  const { ideaid } = Route.useParams();
  return <EditIdeaPage ideaid={ideaid} />;
}
