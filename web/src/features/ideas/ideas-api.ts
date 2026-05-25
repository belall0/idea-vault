import apiClient from "@/shared/api/api-client";
import type { IdeaFormValues } from "@/features/ideas/ideas-schemas";
import type { Idea } from "@/features/ideas/ideas-types";

export const getIdeas = async (): Promise<Idea[]> => {
  const { data } = await apiClient.get("/ideas");
  return data;
};

export const getIdea = async (id: string): Promise<Idea> => {
  const { data } = await apiClient.get(`/ideas/${id}`);
  return data;
};

export const createIdea = async (payload: IdeaFormValues): Promise<Idea> => {
  const { data } = await apiClient.post("/ideas", {
    ...payload,
    createdAt: new Date().toISOString(),
  });
  return data;
};

export const updateIdea = async (id: string, payload: IdeaFormValues): Promise<Idea> => {
  const { data } = await apiClient.put(`/ideas/${id}`, payload);
  return data;
};

export const deleteIdea = async (id: string): Promise<void> => {
  await apiClient.delete(`/ideas/${id}`);
};
