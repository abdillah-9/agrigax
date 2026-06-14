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

module.exports.createPayment = async (trx, data) => {
  const [id] = await trx("payments").insert(data);
  return id;
};
