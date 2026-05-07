import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import IdeaCard from "@/components/IdeaCard";

import { ideasQueryOptions } from "@/queries/ideas.ts";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(ideasQueryOptions);
  },
  component: HomePage,
});

function HomePage() {
  const { data: ideas } = useSuspenseQuery(ideasQueryOptions);

  return (
    <div className="flex flex-col items-start justify-between gap-10 p-6 text-blue-600 md:flex-row">
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to IdeaDrop
        </h1>
        <p className="max-w-xs text-gray-600">
          Share, explore, and build on the best startup ideas and side hustles.
        </p>
      </div>

      <section className="flex-1">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Latest Ideas
        </h2>

        <ul className="space-y-6">
          {ideas.map((idea) => {
            return (
              <li key={idea.id}>
                <IdeaCard idea={idea} />
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <Link
            to="/ideas"
            className="inline-block w-full rounded-md bg-blue-600 px-5 py-2 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            View All Ideas
          </Link>
        </div>
      </section>
    </div>
  );
}
