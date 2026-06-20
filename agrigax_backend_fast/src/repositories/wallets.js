const db = require("../configs/db");

module.exports.getWalletByUserId = async (user_id) => {
  return db("wallets").where({ user_id }).first();
};

module.exports.createWallet = async (user_id) => {
  const [id] = await db("wallets").insert({ user_id, balance: 0, currency: "TZS" });
  return db("wallets").where({ id }).first();
};

module.exports.updateWalletBalance = async (trx, wallet_id, balance) => {
  await trx("wallets").where({ id: wallet_id }).update({ balance, updated_at: trx.fn.now() });
};

module.exports.createTransaction = async (trx, data) => {
  const [id] = await trx("wallet_transactions").insert(data);
  return trx("wallet_transactions").where({ id }).first();
};

module.exports.getTransactionsByWallet = async (wallet_id) => {
  return db("wallet_transactions").where({ wallet_id }).orderBy("created_at", "desc");
};

module.exports.getAllTransactions = async ({ offset, limit, type }) => {
  const query = db("wallet_transactions")
    .join("wallets", "wallet_transactions.wallet_id", "wallets.id")
    .join("users", "wallets.user_id", "users.id")
    .select(
      "wallet_transactions.*",
      "wallets.user_id",
      "users.full_name as user_name",
      "users.username as user_username"
    )
    .orderBy("wallet_transactions.created_at", "desc");

  if (type) {
    query.where("wallet_transactions.type", type);
  }

  const [{ count }] = await query.clone().clearSelect().count({ count: "*" });
  const rows = await query.offset(offset).limit(limit);

  return { rows, total: Number(count) };
};

module.exports.countTransactions = async () => {
  const [{ count }] = await db("wallet_transactions").count({ count: "*" });
  return Number(count);
};

module.exports.createPayment = async (trx, data) => {
  const [id] = await trx("payments").insert(data);
  return id;
};
