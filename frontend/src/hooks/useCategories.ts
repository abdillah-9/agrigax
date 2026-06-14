import { useCallback, useState } from "react";
import apiClient from "../api/client";
import type { ApiResponse, Category, Pagination } from "../types/api.types";

const CATEGORIES_BASE = "/categories";

export function useCategories() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse<Category[]> & { pagination?: Pagination }>(
        CATEGORIES_BASE,
        { params: { limit: "100" } }
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch categories");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchCategories, loading, error };
}
