import { useState } from "react";
import apiClient from "../api/client";
import { WALLET } from "../api/endpoints";
import type { DepositPayload, WithdrawPayload } from "../types/api.types";

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(WALLET.BALANCE);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch wallet");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(WALLET.TRANSACTIONS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deposit = async (payload: DepositPayload) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(WALLET.DEPOSIT, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Deposit failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (payload: WithdrawPayload) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(WALLET.WITHDRAW, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Withdrawal failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchWallet, fetchTransactions, deposit, withdraw, loading, error };
}
