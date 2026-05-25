import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createIdea } from "@/features/ideas/ideas-api";
import {
  ideaFormSchema,
  type IdeaFormValues,
} from "@/features/ideas/ideas-schemas";
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

export default function CreateIdeaForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      title: "",
      summary: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea Created Successfully");
      form.reset();
      navigate({ to: "/ideas" });
    },
    onError: () => {
      toast.error("Failed to create idea");
    },
  });

  function handleSubmit(data: IdeaFormValues) {
    mutation.mutate(data);
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Create New Idea</CardTitle>
        <CardDescription>Share your innovative ideas with us</CardDescription>
      </CardHeader>

      <CardContent>
        <FormProvider {...form}>
          <form
            id="create-idea-form"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <IdeaFormFields />
          </form>
        </FormProvider>
      </CardContent>

      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={mutation.isPending}
          >
            Reset
          </Button>

          <Button
            type="submit"
            form="create-idea-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
