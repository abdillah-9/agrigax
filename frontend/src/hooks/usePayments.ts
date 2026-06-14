import { useCallback, useState } from "react";
import apiClient from "../api/client";
import { WALLET } from "../api/endpoints";
import type {
  ApiResponse,
  DepositPayload,
  Wallet,
  WalletTransaction,
  WithdrawPayload,
} from "../types/api.types";

interface WalletMutationResult {
  wallet: Wallet;
  transaction: WalletTransaction;
}

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<Wallet>>(WALLET.BALANCE);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch wallet");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<ApiResponse<WalletTransaction[]>>(WALLET.TRANSACTIONS);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deposit = useCallback(async (payload: DepositPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<WalletMutationResult>>(WALLET.DEPOSIT, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Deposit failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const withdraw = useCallback(async (payload: WithdrawPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ApiResponse<WalletMutationResult>>(WALLET.WITHDRAW, payload);
      return data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Withdrawal failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchWallet, fetchTransactions, deposit, withdraw, loading, error };
}
