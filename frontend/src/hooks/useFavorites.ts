import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { FAVORITES } from "../api/endpoints";
import type { ApiResponse, Favorite } from "../types/api.types";

export function useFavorites() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Favorite[]>>(FAVORITES.BASE);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch favorites");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (listingId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(FAVORITES.TOGGLE(listingId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add favorite");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFavorite = useCallback(async (listingId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(FAVORITES.TOGGLE(listingId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove favorite");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (listingId: string, isFavorited: boolean) => {
    if (isFavorited) return removeFavorite(listingId);
    return addFavorite(listingId);
  }, [addFavorite, removeFavorite]);

  return { fetchFavorites, addFavorite, removeFavorite, toggleFavorite, loading, error };
}
