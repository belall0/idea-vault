import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "@/components/auth/LoginForm";

export const Route = createFileRoute("/(auth)/login/")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex w-full items-center justify-center py-12">
      <LoginForm />
    </div>
  );
}
