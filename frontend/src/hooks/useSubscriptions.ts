import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { SUBSCRIPTIONS } from "../api/endpoints";
import type {
  ApiResponse,
  CreateSubscriptionRequestPayload,
  CurrentSubscription,
  Pagination,
  PaymentMethod,
  SubscriptionPlan,
  SubscriptionRequest,
  VendorSubscription,
} from "../types/api.types";

// Vendor-facing subscription service layer (docs: agrigax_backend_fast/docs/02-api-specification.md).
export function useSubscriptions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<SubscriptionPlan[]> & { pagination?: Pagination }>(
        SUBSCRIPTIONS.PLANS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch plans");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<PaymentMethod[]>>(
        SUBSCRIPTIONS.PAYMENT_METHODS,
        { params: { page: "1", limit: "100" } }
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch payment methods");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<CurrentSubscription>>(SUBSCRIPTIONS.CURRENT);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch current subscription");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<VendorSubscription[]> & { pagination?: Pagination }>(
        SUBSCRIPTIONS.HISTORY,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscription history");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyRequests = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<SubscriptionRequest[]> & { pagination?: Pagination }>(
        SUBSCRIPTIONS.REQUESTS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch requests");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRequest = useCallback(async (payload: CreateSubscriptionRequestPayload) => {
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<SubscriptionRequest>>(SUBSCRIPTIONS.REQUESTS, {
        planId: Number(payload.planId),
        paymentMethodId: Number(payload.paymentMethodId),
        amount: payload.amount,
        transactionReference: payload.transactionReference,
        receiptUrl: payload.receiptUrl || null,
        notes: payload.notes || null,
      });
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit subscription request");
      return null;
    }
  }, []);

  return {
    fetchPlans,
    fetchPaymentMethods,
    fetchCurrent,
    fetchHistory,
    fetchMyRequests,
    submitRequest,
    loading,
    error,
  };
}
