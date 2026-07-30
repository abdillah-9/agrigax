import type {
  PaymentMethod,
  PaymentMethodPayload,
  SubscriptionPlan,
  SubscriptionPlanPayload,
  SubscriptionRequestStatus,
  VendorSubscriptionStatus,
} from "../types/api.types";

export function formatMoney(amount: number, currency = "TZS") {
  return `${currency} ${Number(amount).toLocaleString()}`;
}

export function formatSubscriptionDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function requestStatusBadge(status: SubscriptionRequestStatus) {
  switch (status) {
    case "approved":
      return "badge badge-success";
    case "pending":
      return "badge badge-warning";
    case "rejected":
      return "badge badge-danger";
    default:
      return "badge badge-default";
  }
}

export function subscriptionStatusBadge(status: VendorSubscriptionStatus) {
  switch (status) {
    case "active":
      return "badge badge-success";
    case "pending":
      return "badge badge-warning";
    case "expired":
      return "badge badge-danger";
    default:
      return "badge badge-default";
  }
}

// "maxFeaturedListings" -> "Max Featured Listings"
export function humanizeKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

export function planDurationLabel(plan: SubscriptionPlan) {
  if (plan.isDefaultVendorPlan) return "Permanent";
  if (plan.durationDays % 365 === 0) {
    const years = plan.durationDays / 365;
    return years === 1 ? "1 year" : `${years} years`;
  }
  if (plan.durationDays % 30 === 0) {
    const months = plan.durationDays / 30;
    return months === 1 ? "1 month" : `${months} months`;
  }
  return `${plan.durationDays} days`;
}

export function paymentMethodSummary(method: PaymentMethod) {
  if (method.type === "mobile_money") return method.phoneNumber || "—";
  if (method.type === "bank_account") {
    return [method.accountName, method.accountNumber].filter(Boolean).join(" — ") || "—";
  }
  return method.instructions || "—";
}

// The admin plan/payment-method endpoints validate snake_case bodies
// (agrigax_backend_fast/src/validations/subscriptionPlans.js, paymentMethods.js).
export function toPlanBody(payload: Partial<SubscriptionPlanPayload>) {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.price !== undefined) body.price = payload.price;
  if (payload.currency !== undefined) body.currency = payload.currency;
  if (payload.durationDays !== undefined) body.duration_days = payload.durationDays;
  if (payload.features !== undefined) body.features = payload.features;
  if (payload.limits !== undefined) body.limits = payload.limits;
  if (payload.isDefaultVendorPlan !== undefined) body.is_default_vendor_plan = payload.isDefaultVendorPlan;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  return body;
}

export function toPaymentMethodBody(payload: Partial<PaymentMethodPayload>) {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.type !== undefined) body.type = payload.type;
  if (payload.accountName !== undefined) body.account_name = payload.accountName;
  if (payload.accountNumber !== undefined) body.account_number = payload.accountNumber;
  if (payload.phoneNumber !== undefined) body.phone_number = payload.phoneNumber;
  if (payload.instructions !== undefined) body.instructions = payload.instructions;
  if (payload.displayOrder !== undefined) body.display_order = payload.displayOrder;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  return body;
}
