import { useState } from "react";
import apiClient from "../api/client";
import { USERS } from "../api/endpoints";
import type { UpdateProfilePayload, UpdateSettingsPayload } from "../types/api.types";

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(USERS.PROFILE);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    setLoading(true);
    try {
      const { data } = await apiClient.put(USERS.PROFILE, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (payload: UpdateSettingsPayload) => {
    setLoading(true);
    try {
      const { data } = await apiClient.put(USERS.SETTINGS, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update settings");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchProfile, updateProfile, updateSettings, loading, error };
}
