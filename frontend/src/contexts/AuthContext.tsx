import { createContext, useCallback, useContext, useMemo, useState } from "react";
import apiClient from "../api/client";
import { AUTH } from "../api/endpoints";
import type { ApiResponse, AuthResponse, User } from "../types/api.types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  checkSession: () => Promise<User | null>;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse<AuthResponse>>(AUTH.ME);
      setUser(data.data.user);
      return data.data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser, checkSession, clearSession }),
    [user, loading, checkSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
