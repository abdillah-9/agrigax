const AppError = require("../errors/AppError");
const {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
} = require("../repositories/paymentMethods");

// Vendor-facing: active methods only, ordered by display_order (§4.2, BR-013).
module.exports.listPaymentMethods = async (pagination) => {
  return getPaymentMethods({ ...pagination, activeOnly: true });
};

// Admin-facing: all methods, including inactive ones (§9 "Configuration").
module.exports.adminListPaymentMethods = async (pagination) => {
  return getPaymentMethods({ ...pagination, activeOnly: false });
};

module.exports.createPaymentMethod = async (body) => {
  return createPaymentMethod({
    name: body.name,
    type: body.type,
    account_name: body.account_name ?? null,
    account_number: body.account_number ?? null,
    phone_number: body.phone_number ?? null,
    instructions: body.instructions ?? null,
    display_order: body.display_order ?? 0,
    is_active: body.is_active ?? true,
  });
};

module.exports.updatePaymentMethod = async (id, body) => {
  const method = await getPaymentMethodById(id);

  if (!method) {
    throw new AppError("Payment method not found", 404);
  }

  return updatePaymentMethod(id, body);
};
