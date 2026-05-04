import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/queries/ideas";
import { deleteIdea } from "@/api/ideas";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

function IdeaDetailsPage() {
  const { ideaid } = Route.useParams();
  const { data: idea } = useSuspenseQuery(ideaDetailQueryOptions(ideaid));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteIdea(ideaid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea Deleted Successfully");
      navigate({ to: "/ideas" });
    },
    onError: () => {
      toast.error("Failed to delete idea");
    },
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/ideas" className="text-blue-500 underline">
          Back to Ideas
        </Link>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: `/ideas/${ideaid}/edit` })}
          >
            Edit
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this idea?")
              ) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
      <h2 className="text-2xl font-bold">{idea.title}</h2>
      <p className="mt-2">{idea.description}</p>
    </div>
  );
}
