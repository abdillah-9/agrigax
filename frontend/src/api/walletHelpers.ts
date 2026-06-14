import type { WalletTransaction } from "../types/api.types";

export function formatWalletAmount(amount: number, currency = "TZS") {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatTransactionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function transactionDisplayType(type: WalletTransaction["type"]) {
  return type === "credit" ? "deposit" : "withdrawal";
}

export function transactionSignedAmount(tx: WalletTransaction) {
  return tx.type === "credit" ? tx.amount : -tx.amount;
}

export function walletStats(transactions: WalletTransaction[]) {
  const totalDeposits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalDeposits,
    totalWithdrawals,
    transactionCount: transactions.length,
  };
}

export const V1_WALLET_NOTICE =
  "V1 wallet is database-only. Deposits and withdrawals update your in-app balance — no real M-Pesa integration yet.";
