import { useState } from "react";
import apiClient from "../api/client";
import { MESSAGES } from "../api/endpoints";
import type { SendMessagePayload } from "../types/api.types";

export function useMessages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(MESSAGES.CONVERSATIONS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(MESSAGES.BY_ID(conversationId));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch messages");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, payload: SendMessagePayload) => {
    try {
      const { data } = await apiClient.post(MESSAGES.SEND(conversationId), payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
      return null;
    }
  };

  return { fetchConversations, fetchMessages, sendMessage, loading, error };
}
