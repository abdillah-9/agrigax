import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { LISTINGS } from "../api/endpoints";
import { toListingCreateBody, toListingUpdateBody } from "../api/mappers";
import type {
  ApiResponse,
  CreateListingPayload,
  Listing,
  Pagination,
  UpdateListingPayload,
} from "../types/api.types";

export function useListings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Listing[]> & { pagination?: Pagination }>(
        LISTINGS.BASE,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch listings");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Listing[]>>(LISTINGS.MY);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch your listings");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchListingById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Listing>>(LISTINGS.BY_ID(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Listing not found");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createListing = useCallback(async (payload: CreateListingPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<Listing>>(
        LISTINGS.BASE,
        toListingCreateBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create listing");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListing = useCallback(async (id: string, payload: UpdateListingPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<Listing>>(
        LISTINGS.BY_ID(id),
        toListingUpdateBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update listing");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(LISTINGS.BY_ID(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete listing");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchListings,
    fetchMyListings,
    fetchListingById,
    createListing,
    updateListing,
    deleteListing,
    loading,
    error,
  };
}
