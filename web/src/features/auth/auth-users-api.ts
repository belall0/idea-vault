import apiClient from "@/shared/api/api-client";
import type { User } from "@/features/auth/auth-types";

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await apiClient.get("/users/me");
  return data;
};
