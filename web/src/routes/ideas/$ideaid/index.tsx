import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/queries/ideas";
import { deleteIdea } from "@/api/ideas";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

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
    <div className="py-4 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/ideas">
            <ArrowLeft data-icon="inline-start" />
            Back to Ideas
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: `/ideas/${ideaid}/edit` })}
          >
            <Pencil data-icon="inline-start" />
            Edit
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this idea?")
              ) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 data-icon="inline-start" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      <h2 className="text-foreground text-2xl font-bold tracking-tight">
        {idea.title}
      </h2>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        {idea.description}
      </p>
    </div>
  );
}
