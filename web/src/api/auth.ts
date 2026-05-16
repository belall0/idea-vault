import apiClient from "@/lib/api-client";
import type { RegisterFormValues } from "@/schemas/auth";

export const register = async (values: RegisterFormValues) => {
  const { confirmPassword: _, ...payload } = values;
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};
