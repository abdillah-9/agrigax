import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { ADMIN } from "../api/endpoints";
import { toCategoryCreateBody, toCategoryUpdateBody } from "../api/adminHelpers";
import type {
  AdminBooking,
  AdminConversation,
  AdminDashboardStats,
  AdminProvider,
  AdminUser,
  ApiResponse,
  Category,
  CreateCategoryPayload,
  Dispute,
  Listing,
  Message,
  Pagination,
  ResolveDisputePayload,
  Review,
  UpdateCategoryPayload,
} from "../types/api.types";

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<AdminDashboardStats>>(ADMIN.DASHBOARD);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch dashboard");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<AdminUser[]> & { pagination?: Pagination }>(
        ADMIN.USERS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProviders = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<AdminProvider[]> & { pagination?: Pagination }>(
        ADMIN.PROVIDERS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch providers");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const suspendUser = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.put(ADMIN.SUSPEND_USER(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to suspend user");
      return false;
    }
  }, []);

  const reinstateUser = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.put(ADMIN.REINSTATE_USER(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reinstate user");
      return false;
    }
  }, []);

  const fetchPendingListings = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Listing[]> & { pagination?: Pagination }>(
        ADMIN.LISTINGS_PENDING,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch pending listings");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveListing = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.put(ADMIN.APPROVE_LISTING(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve listing");
      return false;
    }
  }, []);

  const rejectListing = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.put(ADMIN.REJECT_LISTING(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject listing");
      return false;
    }
  }, []);

  const fetchBookings = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<AdminBooking[]> & { pagination?: Pagination }>(
        ADMIN.BOOKINGS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversations = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<AdminConversation[]> & { pagination?: Pagination }>(
        ADMIN.MESSAGES_CONVERSATIONS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversationMessages = useCallback(async (id: string) => {
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Message[]>>(ADMIN.MESSAGE_BY_ID(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch messages");
      return [];
    }
  }, []);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Dispute[]>>(ADMIN.DISPUTES);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch disputes");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveDispute = useCallback(async (id: string, payload: ResolveDisputePayload) => {
    setError(null);
    try {
      await apiClient.put(ADMIN.RESOLVE_DISPUTE(id), {
        status: payload.status,
        resolutionNote: payload.resolutionNote ?? "",
      });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resolve dispute");
      return false;
    }
  }, []);

  const fetchCategories = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Category[]> & { pagination?: Pagination }>(
        ADMIN.CATEGORIES,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch categories");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (payload: CreateCategoryPayload) => {
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<Category>>(
        ADMIN.CATEGORIES,
        toCategoryCreateBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category");
      return null;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, payload: UpdateCategoryPayload) => {
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<Category>>(
        ADMIN.CATEGORY_BY_ID(id),
        toCategoryUpdateBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update category");
      return null;
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Review[]>>(ADMIN.REVIEWS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch reviews");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const approveReview = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.put(ADMIN.APPROVE_REVIEW(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve review");
      return false;
    }
  }, []);

  const hideReview = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.put(ADMIN.HIDE_REVIEW(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to hide review");
      return false;
    }
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.delete(ADMIN.DELETE_REVIEW(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete review");
      return false;
    }
  }, []);

  return {
    fetchDashboard,
    fetchUsers,
    fetchProviders,
    suspendUser,
    reinstateUser,
    fetchPendingListings,
    approveListing,
    rejectListing,
    fetchBookings,
    fetchConversations,
    fetchConversationMessages,
    fetchDisputes,
    resolveDispute,
    fetchCategories,
    createCategory,
    updateCategory,
    fetchReviews,
    approveReview,
    hideReview,
    deleteReview,
    loading,
    error,
  };
}
