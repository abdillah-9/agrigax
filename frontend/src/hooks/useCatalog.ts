import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { ADMIN, CATALOG } from "../api/endpoints";
import type {
  ApiResponse,
  CatalogImage,
  CatalogImagePayload,
  CatalogImageRequest,
  CatalogRequestStatus,
  Pagination,
} from "../types/api.types";

// Vendor-facing: browse the curated image catalog when creating a listing.
export function useCatalog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchImages = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search?.trim()) params.search = search.trim();

      const { data } = await apiClient.get<ApiResponse<CatalogImage[]>>(CATALOG.IMAGES, { params });
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load images");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const requestImage = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(CATALOG.REQUESTS, { term });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send request");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchImages, requestImage, loading, error };
}

// Admin-facing: manage the catalog and review missed searches / requests.
export function useAdminCatalog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async (page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<CatalogImage[]> & { pagination?: Pagination }>(
        ADMIN.CATALOG_IMAGES,
        { params: { page: String(page), limit: String(limit) } }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load catalog");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const createImage = useCallback(async (payload: CatalogImagePayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<CatalogImage>>(ADMIN.CATALOG_IMAGES, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create image");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateImage = useCallback(async (id: string, payload: Partial<CatalogImagePayload>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<CatalogImage>>(
        ADMIN.CATALOG_IMAGE_BY_ID(id),
        payload
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update image");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteImage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(ADMIN.CATALOG_IMAGE_BY_ID(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete image");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async (status?: CatalogRequestStatus) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (status) params.status = status;

      const { data } = await apiClient.get<ApiResponse<CatalogImageRequest[]>>(
        ADMIN.CATALOG_REQUESTS,
        { params }
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load requests");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveRequest = useCallback(async (id: string, status: CatalogRequestStatus) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<CatalogImageRequest>>(
        ADMIN.CATALOG_REQUEST_BY_ID(id),
        { status }
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update request");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchImages, createImage, updateImage, deleteImage, fetchRequests, resolveRequest, loading, error };
}
