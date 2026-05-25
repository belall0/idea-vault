import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateIdea } from "@/features/ideas/ideas-api";
import { ideaFormSchema, type IdeaFormValues } from "@/features/ideas/ideas-schemas";
import IdeaFormFields from "@/features/ideas/IdeaFormFields";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Field } from "@/shared/ui/field";
import type { Idea } from "@/features/ideas/ideas-types";

export default function EditIdeaForm({ idea }: { idea: Idea }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      title: idea.title,
      summary: idea.summary,
      description: idea.description,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: IdeaFormValues) => updateIdea(idea._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["ideas", idea._id] });
      toast.success("Idea Updated Successfully");
      navigate({ to: `/ideas/${idea._id}` });
    },
    onError: () => {
      toast.error("Failed to update idea");
    },
  });

  function handleSubmit(data: IdeaFormValues) {
    mutation.mutate(data);
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Edit Idea</CardTitle>
        <CardDescription>Update your innovative idea</CardDescription>
      </CardHeader>

      <CardContent>
        <FormProvider {...form}>
          <form id="edit-idea-form" onSubmit={form.handleSubmit(handleSubmit)}>
            <IdeaFormFields />
          </form>
        </FormProvider>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: `/ideas/${idea._id}` })}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="edit-idea-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Save Changes"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
