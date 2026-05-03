import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreateIdea } from "@/modules/ideas/hooks/useCreateIdea";

function IdeaForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const { mutateAsync, isPending } = useCreateIdea();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !summary.trim() || !description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await mutateAsync({
        title,
        summary,
        description,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
      });
      navigate({ to: "/ideas" });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Idea</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label
            htmlFor="title"
            className="mb-1 block font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter idea title"
          />
        </div>

        <div>
          <label
            htmlFor="summary"
            className="mb-1 block font-medium text-gray-700"
          >
            Summary
          </label>
          <input
            id="summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter idea summary"
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="mb-1 block font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="body"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Write out the description of your idea"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="mb-1 block font-medium text-gray-700"
          >
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="optional tags, comma separated"
          />
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={isPending}
            className="block w-full rounded-md bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Idea"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default IdeaForm;
