import { createFileRoute } from "@tanstack/react-router";
import { ideaDetailQueryOptions } from "@/features/ideas/ideas-queries";
import IdeaDetailPage from "@/pages/IdeaDetailPage";

export const Route = createFileRoute("/ideas/$ideaid/")({
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(
      ideaDetailQueryOptions(params.ideaid),
    );
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title }],
  }),
  component: IdeaDetailPageWrapper,
});

function IdeaDetailPageWrapper() {
  const { ideaid } = Route.useParams();
  return <IdeaDetailPage ideaid={ideaid} />;
}
