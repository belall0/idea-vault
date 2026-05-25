import { createFileRoute } from "@tanstack/react-router";
import RegisterForm from "@/components/auth/RegisterForm";

export const Route = createFileRoute("/(auth)/register/")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex w-full items-center justify-center py-12">
      <RegisterForm />
    </div>
  );
}
