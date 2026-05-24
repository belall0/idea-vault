import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ideasQueryOptions } from "@/queries/ideas";
import IdeaCard from "@/components/IdeaCard";

export const Route = createFileRoute("/ideas/")({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(ideasQueryOptions);
  },
  head: () => ({
    meta: [{ title: "Browse Ideas" }],
  }),
  component: IdeasPage,
});

function IdeasPage() {
  const { data: ideas } = useSuspenseQuery(ideasQueryOptions);

  return (
    <div className="py-4 md:py-8">
      <header className="mb-8 border-b pb-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Ideas
        </h1>
        <p className="text-muted-foreground mt-2">
          A collection of thoughts and inspirations.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <li key={idea._id}>
            <IdeaCard idea={idea} />
          </li>
        ))}
      </ul>
    </div>
  );
}
