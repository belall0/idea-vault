import { useSuspenseQuery } from "@tanstack/react-query";
import { ideaDetailQueryOptions } from "@/features/ideas/ideas-queries";
import EditIdeaForm from "@/features/ideas/EditIdeaForm";

function EditIdeaPage({ ideaid }: { ideaid: string }) {
  const { data: idea } = useSuspenseQuery(ideaDetailQueryOptions(ideaid));

  return (
    <div className="flex justify-center p-4">
      <EditIdeaForm idea={idea} />
    </div>
  );
}

export default EditIdeaPage;
