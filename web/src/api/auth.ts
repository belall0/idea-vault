import apiClient from "@/lib/api-client";
import type { RegisterFormValues, LoginFormValues } from "@/schemas/auth";

export const register = async (values: RegisterFormValues) => {
  const { confirmPassword: _, ...payload } = values;
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

export const login = async (values: LoginFormValues) => {
  const { data } = await apiClient.post("/auth/login", values);
  return data;
};
