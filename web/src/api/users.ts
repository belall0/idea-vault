import apiClient from "@/lib/api-client";
import type { User } from "@/types/auth";

export const getCurrentUser = async (token?: string): Promise<User> => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const { data } = await apiClient.get("/users/me", config);
  return data;
};
