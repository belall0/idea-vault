import apiClient from "@/lib/api-client";
import type { Idea, CreateIdeaPayload } from "@/modules/ideas/types";

export const getIdeas = async (): Promise<Idea[]> => {
  const { data } = await apiClient.get("/ideas");
  return data;
};

export const getIdea = async (id: string): Promise<Idea> => {
  const { data } = await apiClient.get(`/ideas/${id}`);
  return data;
};

export const createIdea = async (payload: CreateIdeaPayload): Promise<Idea> => {
  const { data } = await apiClient.post("/ideas", {
    ...payload,
    createdAt: new Date().toISOString(),
  });
  return data;
};
