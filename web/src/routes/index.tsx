import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    <div className="flex flex-col gap-10 py-4 md:flex-row md:items-start md:py-8">
      {/* Hero section */}
      <div className="flex flex-col gap-4 md:max-w-xs md:pt-4">
        <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
          Welcome to IdeaDrop
        </h1>
        <p className="text-muted-foreground max-w-xs leading-relaxed">
          Share, explore, and build on the best startup ideas and side hustles.
        </p>
      </div>

      {/* Latest ideas */}
      <section className="flex-1">
        <h2 className="text-foreground mb-4 text-xl font-semibold tracking-tight md:text-2xl">
          Latest Ideas
        </h2>

        <ul className="flex flex-col gap-4">
          {ideas.map((idea) => {
            return (
              <li key={idea._id}>
                <IdeaCard idea={idea} />
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <Button asChild className="w-full md:w-auto">
            <Link to="/ideas">
              View All Ideas
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
