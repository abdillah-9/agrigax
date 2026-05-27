import { useState } from "react";
import apiClient from "../api/client";
import { LISTINGS } from "../api/endpoints";
import type { CreateListingPayload, UpdateListingPayload } from "../types/api.types";

export function useListings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(LISTINGS.BASE, { params });
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch listings");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(LISTINGS.MY);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch your listings");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchListingById = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(LISTINGS.BY_ID(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Listing not found");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (payload: CreateListingPayload) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(LISTINGS.BASE, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create listing");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateListing = async (id: string, payload: UpdateListingPayload) => {
    setLoading(true);
    try {
      const { data } = await apiClient.put(LISTINGS.BY_ID(id), payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update listing");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    setLoading(true);
    try {
      await apiClient.delete(LISTINGS.BY_ID(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete listing");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { fetchListings, fetchMyListings, fetchListingById, createListing, updateListing, deleteListing, loading, error };
}
