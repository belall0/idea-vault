import apiClient from "@/lib/api-client";
import type { User } from "@/types/auth";

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await apiClient.get("/users/me");
  return data;
};
