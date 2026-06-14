import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { REVIEWS } from "../api/endpoints";
import { toReviewCreateBody } from "../api/mappers";
import type { ApiResponse, CreateReviewPayload, Review } from "../types/api.types";

export function useReviews() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (listingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Review[]>>(REVIEWS.BASE, {
        params: { listingId },
      });
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch reviews");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = useCallback(async (payload: CreateReviewPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<Review>>(
        REVIEWS.BASE,
        toReviewCreateBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit review");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(REVIEWS.BY_ID(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete review");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchReviews, createReview, deleteReview, loading, error };
}
