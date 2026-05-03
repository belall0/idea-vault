import { Link, useParams } from "@tanstack/react-router";
import { useIdea } from "../hooks/useIdea";

export function IdeaDetailsPage() {
  const { ideaid } = useParams({ strict: false });
  const { data: idea } = useIdea(ideaid as string);

  return (
    <div className="p-4">
      <Link to="/ideas" className="black m-4 text-blue-500 underline">
        Back to Ideas
      </Link>
      <h2 className="text-2xl font-bold">{idea.title}</h2>
      <p className="mt-2">{idea.description}</p>
    </div>
  );
}
