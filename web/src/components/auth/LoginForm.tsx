import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { loginFormSchema, type LoginFormValues } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/api/auth";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/api/users";
import { useAuth } from "@/hooks/useAuth";
import { setToken } from "@/lib/api-client";

function LoginForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { access_token } = await login(values);
      setToken(access_token);
      const user = await getCurrentUser();
      return { access_token, user };
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      toast.success("Logged in successfully");
      form.reset();
      navigate({ to: "/" });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to login";
      toast.error(Array.isArray(message) ? message[0] : message);
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

  function handleSubmit(data: LoginFormValues) {
    mutation.mutate(data);
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Login to your account to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <FormProvider {...form}>
          <form id="login-form" onSubmit={form.handleSubmit(handleSubmit)}>
            {errorMessages && (
              <div className="border-destructive/20 bg-destructive/5 mb-6 rounded-lg border p-3">
                <FieldError
                  errors={errorMessages.map((m: any) => ({ message: m }))}
                />
              </div>
            )}
            <FieldGroup>
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
                      autoComplete="current-password"
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
            form="login-form"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-foreground underline underline-offset-4"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default LoginForm;
