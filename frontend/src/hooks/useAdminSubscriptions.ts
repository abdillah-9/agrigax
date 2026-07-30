import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { ADMIN } from "../api/endpoints";
import { toPlanBody, toPaymentMethodBody } from "../api/subscriptionHelpers";
import type {
  ApiResponse,
  ExpirationsReport,
  Pagination,
  PaymentMethod,
  PaymentMethodPayload,
  RequestCountsReport,
  RevenueReport,
  SubscriptionPlan,
  SubscriptionPlanPayload,
  SubscriptionRequest,
  SubscriptionRequestDetail,
  VendorCountsReport,
  VendorSubscription,
} from "../types/api.types";

interface ApproveResult {
  request: SubscriptionRequest;
  subscription: VendorSubscription;
}

// Admin-facing subscription service layer (plan catalog, payment methods,
// request approval, subscription views, reports).
export function useAdminSubscriptions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<SubscriptionPlan[]> & { pagination?: Pagination }>(
        ADMIN.SUBSCRIPTION_PLANS,
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

  const createPlan = useCallback(async (payload: SubscriptionPlanPayload) => {
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<SubscriptionPlan>>(
        ADMIN.SUBSCRIPTION_PLANS,
        toPlanBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create plan");
      return null;
    }
  }, []);

  const updatePlan = useCallback(async (id: string, payload: Partial<SubscriptionPlanPayload>) => {
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<SubscriptionPlan>>(
        ADMIN.SUBSCRIPTION_PLAN_BY_ID(id),
        toPlanBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update plan");
      return null;
    }
  }, []);

  const deletePlan = useCallback(async (id: string) => {
    setError(null);
    try {
      await apiClient.delete(ADMIN.SUBSCRIPTION_PLAN_BY_ID(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete plan");
      return false;
    }
  }, []);

  const fetchPaymentMethods = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<PaymentMethod[]> & { pagination?: Pagination }>(
        ADMIN.PAYMENT_METHODS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch payment methods");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaymentMethod = useCallback(async (payload: PaymentMethodPayload) => {
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<PaymentMethod>>(
        ADMIN.PAYMENT_METHODS,
        toPaymentMethodBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create payment method");
      return null;
    }
  }, []);

  const updatePaymentMethod = useCallback(async (id: string, payload: Partial<PaymentMethodPayload>) => {
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<PaymentMethod>>(
        ADMIN.PAYMENT_METHOD_BY_ID(id),
        toPaymentMethodBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update payment method");
      return null;
    }
  }, []);

  const fetchRequests = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<SubscriptionRequest[]> & { pagination?: Pagination }>(
        ADMIN.SUBSCRIPTION_REQUESTS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscription requests");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequestDetail = useCallback(async (id: string) => {
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<SubscriptionRequestDetail>>(
        ADMIN.SUBSCRIPTION_REQUEST_BY_ID(id)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch request details");
      return null;
    }
  }, []);

  const approveRequest = useCallback(async (id: string) => {
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<ApproveResult>>(
        ADMIN.APPROVE_SUBSCRIPTION_REQUEST(id)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve request");
      return null;
    }
  }, []);

  const rejectRequest = useCallback(async (id: string, comment?: string) => {
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<SubscriptionRequest>>(
        ADMIN.REJECT_SUBSCRIPTION_REQUEST(id),
        { comment: comment || "" }
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject request");
      return null;
    }
  }, []);

  const fetchVendorSubscriptions = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<VendorSubscription[]> & { pagination?: Pagination }>(
        ADMIN.VENDOR_SUBSCRIPTIONS,
        { params }
      );
      return { items: data.data, pagination: data.pagination };
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch vendor subscriptions");
      return { items: [], pagination: undefined };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRevenueReport = useCallback(async (period: "total" | "monthly" | "yearly") => {
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<RevenueReport>>(ADMIN.REPORT_REVENUE, {
        params: { period },
      });
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch revenue report");
      return null;
    }
  }, []);

  const fetchVendorCounts = useCallback(async () => {
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<VendorCountsReport>>(ADMIN.REPORT_VENDORS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch vendor counts");
      return null;
    }
  }, []);

  const fetchRequestCounts = useCallback(async () => {
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<RequestCountsReport>>(ADMIN.REPORT_REQUESTS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch request counts");
      return null;
    }
  }, []);

  const fetchExpirationsReport = useCallback(async () => {
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<ExpirationsReport>>(ADMIN.REPORT_EXPIRATIONS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch expirations report");
      return null;
    }
  }, []);

  return {
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    fetchRequests,
    fetchRequestDetail,
    approveRequest,
    rejectRequest,
    fetchVendorSubscriptions,
    fetchRevenueReport,
    fetchVendorCounts,
    fetchRequestCounts,
    fetchExpirationsReport,
    loading,
    error,
  };
}
