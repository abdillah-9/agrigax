const { getUserById } = require("../repositories/auth");
const { getListingById } = require("../repositories/listings");
const { listPayments, countPayments } = require("../repositories/payments");
const { formatPayment } = require("../utils/formatters");

const enrichPayment = async (payment) => {
  const [payer, receiver] = await Promise.all([
    getUserById(payment.payer_id),
    getUserById(payment.receiver_id),
  ]);

  return {
    ...formatPayment(payment),
    customerName: payer?.full_name ?? null,
    providerName: receiver?.full_name ?? null,
  };
};

module.exports.listAllPayments = async ({ offset, limit, status }) => {
  const { rows, total } = await listPayments({ offset, limit, status });
  const data = await Promise.all(rows.map(enrichPayment));
  return { data, total };
};

module.exports.listRefundedPayments = async ({ offset, limit }) => {
  return module.exports.listAllPayments({ offset, limit, status: "refunded" });
};

module.exports.countAllPayments = async () => countPayments();
