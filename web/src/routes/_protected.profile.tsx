import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, clearAuth } = useAuth();

  return (
    <div className="p-8 max-w-2xl mx-auto mt-10 shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="space-y-2">
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <button
        onClick={clearAuth}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
