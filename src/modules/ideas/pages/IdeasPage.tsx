import { useIdeas } from "../hooks/useIdeas";
import IdeaCard from "../components/IdeaCard";
import type { Idea } from "../types";

export function IdeasPage() {
  const { data: ideas } = useIdeas();
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 border-b border-gray-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ideas
          </h1>
          <p className="mt-2 text-gray-600">
            A collection of thoughts and inspirations.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea: Idea) => (
            <li key={idea.id}>
              <IdeaCard idea={idea} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
