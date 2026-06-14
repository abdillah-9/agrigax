import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { BOOKINGS } from "../api/endpoints";
import { toBookingCreateBody } from "../api/mappers";
import type { ApiResponse, Booking, CreateBookingPayload } from "../types/api.types";

export function useBookings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Booking[]>>(BOOKINGS.MY);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProviderBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Booking[]>>(BOOKINGS.PROVIDER);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookingById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Booking>>(BOOKINGS.BY_ID(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Booking not found");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (payload: CreateBookingPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<Booking>>(
        BOOKINGS.BASE,
        toBookingCreateBody(payload)
      );
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create booking");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<Booking>>(BOOKINGS.ACCEPT(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept booking");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<Booking>>(BOOKINGS.REJECT(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject booking");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<Booking>>(BOOKINGS.COMPLETE(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to complete booking");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.put<ApiResponse<Booking>>(BOOKINGS.CANCEL(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel booking");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchMyBookings,
    fetchProviderBookings,
    fetchBookingById,
    createBooking,
    acceptBooking,
    rejectBooking,
    completeBooking,
    cancelBooking,
    loading,
    error,
  };
}
