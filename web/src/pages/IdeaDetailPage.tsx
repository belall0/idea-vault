import { Link, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/features/ideas/ideas-queries";
import { deleteIdea } from "@/features/ideas/ideas-api";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

function IdeaDetailPage({ ideaid }: { ideaid: string }) {
  const { data: idea } = useSuspenseQuery(ideaDetailQueryOptions(ideaid));
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOwner = user?.id === idea.userId;

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
        {isOwner && (
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
        )}
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

export default IdeaDetailPage;
