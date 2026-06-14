import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { MESSAGES } from "../api/endpoints";
import type {
  ApiResponse,
  Conversation,
  Message,
  SendMessagePayload,
  StartConversationPayload,
} from "../types/api.types";

export function useMessages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Conversation[]>>(MESSAGES.CONVERSATIONS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Message[]>>(MESSAGES.BY_ID(conversationId));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch messages");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const startConversation = useCallback(async (payload: StartConversationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<Conversation>>(MESSAGES.CREATE, {
        userTwoId: Number(payload.userTwoId),
        listingId: payload.listingId ? Number(payload.listingId) : null,
      });
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to start conversation");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, payload: SendMessagePayload) => {
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<Message>>(
        MESSAGES.SEND(conversationId),
        payload
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
      return null;
    }
  }, []);

  return {
    fetchConversations,
    fetchMessages,
    startConversation,
    sendMessage,
    loading,
    error,
  };
}
