const AppError = require("../errors/AppError");
const db = require("../configs/db");
const {
  getWalletByUserId,
  createWallet,
  updateWalletBalance,
  createTransaction,
  getTransactionsByWallet,
} = require("../repositories/wallets");
const { formatWallet, formatTransaction } = require("../utils/formatters");

const getOrCreateWallet = async (userId) => {
  let wallet = await getWalletByUserId(userId);

  if (!wallet) {
    wallet = await createWallet(userId);
  }

  return wallet;
};

module.exports.getUserWallet = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  return formatWallet(wallet);
};

module.exports.getUserTransactions = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  const rows = await getTransactionsByWallet(wallet.id);
  return rows.map(formatTransaction);
};

const applyWalletChange = async ({ userId, type, amount, reference, description, method }) => {
  if (amount <= 0) {
    throw new AppError("Amount must be greater than zero", 400);
  }

  return db.transaction(async (trx) => {
    let wallet = await trx("wallets").where({ user_id: userId }).forUpdate().first();

    if (!wallet) {
      const [walletId] = await trx("wallets").insert({ user_id: userId, balance: 0, currency: "TZS" });
      wallet = await trx("wallets").where({ id: walletId }).first();
    }

    const currentBalance = Number(wallet.balance);

    if (type === "debit" && currentBalance < amount) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    const newBalance = type === "credit" ? currentBalance + amount : currentBalance - amount;

    await updateWalletBalance(trx, wallet.id, newBalance);

    const tx = await createTransaction(trx, {
      wallet_id: wallet.id,
      type,
      amount,
      reference: reference || method || null,
      description: description || `${type} via wallet`,
    });

    return {
      wallet: formatWallet({ ...wallet, balance: newBalance }),
      transaction: formatTransaction(tx),
    };
  });
};

module.exports.deposit = async (userId, body) => {
  return applyWalletChange({
    userId,
    type: "credit",
    amount: Number(body.amount),
    reference: body.phone,
    description: `Deposit via ${body.method || "manual"}`,
    method: body.method,
  });
};

module.exports.withdraw = async (userId, body) => {
  return applyWalletChange({
    userId,
    type: "debit",
    amount: Number(body.amount),
    reference: body.phone,
    description: `Withdrawal via ${body.method || "manual"}`,
    method: body.method,
  });
};
