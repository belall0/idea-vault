import React, {
  createContext,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import apiClient from "@/lib/api-client";
import type { User, AuthContextValue } from "@/types/auth";
import { refresh, logout as apiLogout } from "@/api/auth";
import { getCurrentUser } from "@/api/users";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up Axios interceptors for this provider instance
  useLayoutEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },

      (error) => Promise.reject(error),
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loop if /auth/refresh itself fails with 401
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== "/auth/refresh" &&
          originalRequest.url !== "/auth/login" &&
          originalRequest.url !== "/auth/register"
        ) {
          originalRequest._retry = true;

          try {
            const { access_token } = await refresh();
            setAccessToken(access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear auth
            setUser(null);
            setAccessToken(null);
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
  }, [accessToken]); // Re-bind interceptors when accessToken changes so they have the latest value

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { access_token } = await refresh();
        setAccessToken(access_token);
        const userData = await getCurrentUser(access_token);
        setUser(userData);
      } catch (err) {
        console.error(err);
        // No valid session, or refresh token expired/missing, this is fine
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setAuth = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  };

  const clearAuth = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error(err);
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
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
