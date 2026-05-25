export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => Promise<void>;
  isLoading: boolean;
};
