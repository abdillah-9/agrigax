import { useState } from "react";
import apiClient from "../api/client";
import { ADMIN } from "../api/endpoints";

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(ADMIN.DASHBOARD);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch dashboard");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const approveListing = async (id: string) => {
    try {
      await apiClient.put(ADMIN.APPROVE_LISTING(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve");
      return false;
    }
  };

  const rejectListing = async (id: string) => {
    try {
      await apiClient.put(ADMIN.REJECT_LISTING(id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject");
      return false;
    }
  };

  const suspendUser = async (id: string) => {
    try {
      await apiClient.put(`/admin/users/${id}/suspend`);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to suspend user");
      return false;
    }
  };

  return { fetchDashboard, approveListing, rejectListing, suspendUser, loading, error };
}
