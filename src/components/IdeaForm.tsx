import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { createIdea } from "@/api/ideas";
import { ideaFormSchema, type IdeaFormValues } from "@/schemas/idea";

function IdeaForm() {
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
        <form id="create-idea-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            {/* title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>

                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter Idea Title"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* summary */}
            <Controller
              name="summary"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="summary">Summary</FieldLabel>

                  <Input
                    {...field}
                    id="summary"
                    placeholder="Enter Idea Summary"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>

                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="description"
                      placeholder="Write the description of your idea"
                      rows={6}
                      className="min-h-24 resize-none"
                    />

                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/100 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
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

export default IdeaForm;
