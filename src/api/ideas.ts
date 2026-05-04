import apiClient from "@/lib/api-client";
import type { Idea } from "@/types/idea";

export const getIdeas = async (): Promise<Idea[]> => {
  const { data } = await apiClient.get("/ideas");
  return data;
};

export const getIdea = async (id: string): Promise<Idea> => {
  const { data } = await apiClient.get(`/ideas/${id}`);
  return data;
};
