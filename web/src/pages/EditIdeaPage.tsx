import { useSuspenseQuery } from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/features/ideas/ideas-queries";
import EditIdeaForm from "@/features/ideas/EditIdeaForm";

export default function EditIdeaPage({ ideaid }: { ideaid: string }) {
  const { data: idea } = useSuspenseQuery(ideaDetailQueryOptions(ideaid));

  return (
    <div className="flex justify-center p-4">
      <EditIdeaForm idea={idea} />
    </div>
  );
}
