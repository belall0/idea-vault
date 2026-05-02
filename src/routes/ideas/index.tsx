import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import axiosApi from "../../lib/axios";
import type { Idea } from "../../types";

const fetchIdeas = async (): Promise<Idea[]> => {
  const { data } = await axiosApi.get("/ideas");
  return data;
};

const ideasQueryOptions = () =>
  queryOptions({
    queryKey: ["ideas"],
    queryFn: () => fetchIdeas(),
  });

export const Route = createFileRoute("/ideas/")({
  head: () => ({
    meta: [{ title: "Idea Vault — Browse Ideas" }],
  }),
  component: IdeasPage,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(ideasQueryOptions());
  },
});

function IdeasPage() {
  const { data: ideas } = useSuspenseQuery(ideasQueryOptions());
  console.log(ideas);
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
              <Link
                to="/ideas/$ideaid"
                params={{ ideaid: idea.id }}
                className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5"
              >
                <h2 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                  {idea.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                  {idea.summary}
                </p>
                <div className="mt-auto flex items-center pt-6 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                  View Idea
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
