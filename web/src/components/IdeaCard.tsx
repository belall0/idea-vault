import { Link } from "@tanstack/react-router";
import type { Idea } from "@/types/idea";

function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link
      to="/ideas/$ideaid"
      params={{ ideaid: idea.id }}
      className="border-border bg-background hover:bg-accent flex flex-col gap-2 rounded border p-4"
    >
      <h2 className="text-foreground text-lg font-semibold">{idea.title}</h2>
      <p className="text-muted-foreground text-sm">{idea.summary}</p>
      <div className="text-foreground mt-2 text-sm font-medium">View Idea</div>
    </Link>
  );
}

export default IdeaCard;
