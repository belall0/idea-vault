import React, {
  createContext,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";

import apiClient, { setToken, getToken } from "@/lib/api-client";
import { refresh, logout as apiLogout } from "@/api/auth";
import { getCurrentUser } from "@/api/users";
import type { User, AuthContextValue } from "@/types/auth";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // update both the module-level token (sync, for interceptors) and React state (for re-renders)
  const applyToken = (token: string | null) => {
    setToken(token);
    setAccessToken(token);
  };

  // Interceptors registered once, reads from module-level getToken(), not state
  // useLayoutEffect ensures they're registered before any child renders fire requests
  useLayoutEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.skipAuthRetry
        ) {
          originalRequest._retry = true;

          try {
            const { access_token } = await refresh();

            applyToken(access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;

            return apiClient(originalRequest);
          } catch (refreshError) {
            applyToken(null);
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { access_token } = await refresh();
        applyToken(access_token);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        // No valid session — expected for unauthenticated users
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuth = (token: string, userData: User) => {
    applyToken(token);
    setUser(userData);
  };

  const clearAuth = async () => {
    try {
      await apiLogout();
    } catch {
      // Network failure on logout is ignorable
    } finally {
      applyToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, setAuth, clearAuth, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
