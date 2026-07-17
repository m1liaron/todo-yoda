"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { getToken, setToken, clearToken } from "@/lib/auth";
import { usersApi, authApi, User, ApiError } from "@/lib/api";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const token = getToken();

  const logout = () => {
    clearToken();
    setUser(null);
    router.replace("/login");
  };

  const refreshUser = async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const user = await usersApi.getMe();
      setUser(user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        return;
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    setToken(response.access_token);
    setUser(response.user);

    router.replace("/");
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}