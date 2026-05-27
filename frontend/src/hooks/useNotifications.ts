import { useState } from "react";
import apiClient from "../api/client";
import { NOTIFICATIONS } from "../api/endpoints";

export function useNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(NOTIFICATIONS.BASE);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch notifications");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiClient.put(NOTIFICATIONS.MARK_READ(id));
      return true;
    } catch {
      return false;
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.put(NOTIFICATIONS.MARK_ALL);
      return true;
    } catch {
      return false;
    }
  };

  return { fetchNotifications, markRead, markAllRead, loading, error };
}
