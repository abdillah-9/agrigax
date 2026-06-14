const { getUserWallet, getUserTransactions, deposit, withdraw } = require("../services/wallets");
const { sendSuccess } = require("../utils/response");

module.exports.getWallet = async (req, res, next) => {
  try {
    const data = await getUserWallet(req.user.id);
    return sendSuccess(res, data, "Wallet fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getTransactions = async (req, res, next) => {
  try {
    const data = await getUserTransactions(req.user.id);
    return sendSuccess(res, data, "Transactions fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.deposit = async (req, res, next) => {
  try {
    const data = await deposit(req.user.id, req.body);
    return sendSuccess(res, data, "Deposit recorded", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.withdraw = async (req, res, next) => {
  try {
    const data = await withdraw(req.user.id, req.body);
    return sendSuccess(res, data, "Withdrawal recorded", 201);
  } catch (e) {
    next(e);
  }
};
