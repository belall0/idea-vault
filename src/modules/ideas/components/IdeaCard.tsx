import { Link } from "@tanstack/react-router";
import type { IdeaCardProps } from "@/modules/ideas/types";

function IdeaCard({ idea }: IdeaCardProps) {
  return (
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
  );
}

export default IdeaCard;
