import { Controller, useFormContext } from "react-hook-form";
import { type IdeaFormValues } from "@/schemas/idea";
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

export default function IdeaFormFields() {
  const form = useFormContext<IdeaFormValues>();

  return (
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

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
