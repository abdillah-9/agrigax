import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { USERS } from "../api/endpoints";
import { toProfileUpdateBody } from "../api/mappers";
import type { ApiResponse, UpdateProfilePayload, UpdateSettingsPayload, User } from "../types/api.types";

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<{ user: User }>>(USERS.PROFILE);
      return data.data.user;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch profile");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<{ user: User }>>(
        USERS.PROFILE,
        toProfileUpdateBody(payload)
      );
      return data.data.user;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse<{ user: User }>>(USERS.BY_ID(id));
      return data.data.user;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (payload: UpdateSettingsPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put(USERS.SETTINGS, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update settings");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchProfile, fetchUserById, updateProfile, updateSettings, loading, error };
}
