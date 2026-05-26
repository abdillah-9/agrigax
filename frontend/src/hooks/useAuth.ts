import { useState } from "react";
import apiClient from "../api/client";
import { AUTH } from "../api/endpoints";
import type { LoginPayload, RegisterPayload, AuthResponse, ApiResponse } from "../types/api.types";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(AUTH.LOGIN, payload);
      localStorage.setItem("auth_token", data.data.token);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(AUTH.REGISTER, payload);
      localStorage.setItem("auth_token", data.data.token);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  const getMe = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(AUTH.ME);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch user");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, logout, getMe, loading, error };
}
