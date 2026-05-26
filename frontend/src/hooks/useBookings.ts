import { useState } from "react";
import apiClient from "../api/client";
import { BOOKINGS } from "../api/endpoints";
import type { CreateBookingPayload } from "../types/api.types";

export function useBookings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(BOOKINGS.MY_BOOKINGS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderBookings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(BOOKINGS.PROVIDER_BOOKINGS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (payload: CreateBookingPayload) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(BOOKINGS.CREATE, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const acceptBooking = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.put(BOOKINGS.ACCEPT(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const rejectBooking = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.put(BOOKINGS.REJECT(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.put(BOOKINGS.CANCEL(id));
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchMyBookings, fetchProviderBookings, createBooking, acceptBooking, rejectBooking, cancelBooking, loading, error };
}
