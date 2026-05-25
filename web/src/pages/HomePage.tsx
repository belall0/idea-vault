import { useAuth } from "@/features/auth/auth-context";

function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <h1>Welcome {user.name}</h1>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-600 sm:text-5xl">
            Welcome to IdeaVault
          </h1>
          <p className="mt-4 max-w-md text-lg text-gray-600">
            Share, explore, and build on the best startup ideas and side
            hustles.
          </p>
        </div>
      )}
    </>
  );
}

export default HomePage;
