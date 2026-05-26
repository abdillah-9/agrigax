import { useState } from "react";
import apiClient from "../api/client";
import { FAVORITES } from "../api/endpoints";

export function useFavorites() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(FAVORITES.BASE);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch favorites");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (providerId: string) => {
    setLoading(true);
    try {
      await apiClient.post(FAVORITES.ADD(providerId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add favorite");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (providerId: string) => {
    setLoading(true);
    try {
      await apiClient.delete(FAVORITES.REMOVE(providerId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove favorite");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { fetchFavorites, addFavorite, removeFavorite, loading, error };
}
