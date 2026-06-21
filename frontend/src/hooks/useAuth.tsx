"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface User {
  _id: string;
  id?: string;
  email: string;
  fullName: string;
  role: "participant" | "organizer" | "judge" | "super_admin";
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: any) => Promise<User | undefined>;
  register: (data: any) => Promise<User | undefined>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const router = useRouter();

  const refreshAuth = useCallback(async () => {
    try {
      const res = await api.post("/auth/refresh");
      setAccessToken(res.data.accessToken);
      
      const meRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${res.data.accessToken}` },
      });
      setUser(meRes.data.data);
      return res.data.accessToken;
    } catch (err) {
      setUser(null);
      setAccessToken(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const csrfRes = await api.get("/csrf-token");
        setCsrfToken(csrfRes.data.csrfToken);
        api.defaults.headers.common["X-CSRF-Token"] = csrfRes.data.csrfToken;
        await refreshAuth();
      } catch (err) {
        console.warn("Not authenticated on mount");
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [refreshAuth]);

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use((config) => {
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
      if (csrfToken) config.headers["X-CSRF-Token"] = csrfToken;
      return config;
    });

    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await refreshAuth();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            setUser(null);
            setAccessToken(null);
            router.push("/login");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, csrfToken, refreshAuth, router]);

  useEffect(() => {
    if (!accessToken) return;
    const refreshTimer = setTimeout(() => {
      refreshAuth();
    }, 13 * 60 * 1000); // Refresh at 13 mins (expires at 15)
    return () => clearTimeout(refreshTimer);
  }, [accessToken, refreshAuth]);

  const login = async (data: any) => {
    const res = await api.post("/auth/login", data);
    setAccessToken(res.data.accessToken);
    const loggedInUser = { ...res.data.user, role: res.data.role || res.data.user.role };
    setUser(loggedInUser);
    return loggedInUser;
  };

  const registerUser = async (data: any) => {
    const res = await api.post("/auth/register", data);
    setAccessToken(res.data.accessToken);
    const loggedInUser = { ...res.data.user, role: res.data.role || res.data.user.role };
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      isLoading, 
      isAuthenticated: !!user,
      login, 
      register: registerUser, 
      logout, 
      refreshAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
