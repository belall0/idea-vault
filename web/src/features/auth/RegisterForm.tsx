import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerFormSchema, type RegisterFormValues } from "@/features/auth/auth-schemas";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { register } from "@/features/auth/auth-api";

import { Controller } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

function RegisterForm() {
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Registered Successfully");
      form.reset();
      navigate({ to: "/login" });
    },
    onError: () => {
      toast.error("Failed to register");
    },
  });

  const errorMessages = useMemo(() => {
    if (!mutation.error) return null;

    const errorData = (mutation.error as any)?.response?.data;
    if (!errorData) return ["An unexpected error occurred"];

    if (Array.isArray(errorData.message)) {
      return errorData.message;
    }

    return [errorData.message || "An unexpected error occurred"];
  }, [mutation.error]);

  function handleSubmit(data: RegisterFormValues) {
    mutation.mutate(data);
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Register New Account</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>

      <CardContent>
        <FormProvider {...form}>
          <form id="register-form" onSubmit={form.handleSubmit(handleSubmit)}>
            {errorMessages && (
              <div className="border-destructive/20 bg-destructive/5 mb-6 rounded-lg border p-3">
                <FieldError
                  errors={errorMessages.map((m: any) => ({ message: m }))}
                />
              </div>
            )}
            <FieldGroup>
              {/* name */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>

                    <Input
                      {...field}
                      id="name"
                      placeholder="Enter your Name"
                      autoComplete="name"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>

                    <Input
                      {...field}
                      type="email"
                      id="email"
                      placeholder="Enter your Email"
                      autoComplete="email"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* password */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      id="password"
                      placeholder="Enter your Password"
                      autoComplete="new-password"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* password */}
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">
                      ConfirmPassword
                    </FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      id="confirmPassword"
                      placeholder="Enter your ConfirmPassword"
                      autoComplete="new-password"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </FormProvider>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-4">
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="register-form"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </Field>

        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-foreground underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default RegisterForm;
