import axios from "axios";

let accessToken: string | null = null;

export const setToken = (token: string | null) => {
  accessToken = token;
};

export const getToken = (): string | null => accessToken;

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
