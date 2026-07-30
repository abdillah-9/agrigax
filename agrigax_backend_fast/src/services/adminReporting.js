const AppError = require("../errors/AppError");
const {
  getTotalRevenue,
  getMonthlyRevenue,
  getYearlyRevenue,
  countByStatus: countRequestsByStatus,
  getRequestsByStatusAndDateRange,
} = require("../repositories/subscriptionRequests");
const {
  countActiveVendors,
  countActiveVendorsOnDefaultPlan,
  countByStatus: countSubscriptionsByStatus,
  countExpiringWithin,
} = require("../repositories/vendorSubscriptions");

const PERIODS = ["total", "monthly", "yearly"];

// §9 Reporting — total/monthly/yearly revenue, derived entirely from
// approved subscription_requests (no live gateway).
module.exports.getRevenueReport = async (period = "total") => {
  if (!PERIODS.includes(period)) {
    throw new AppError(`period must be one of: ${PERIODS.join(", ")}`, 400);
  }

  if (period === "total") {
    return { period, total: await getTotalRevenue() };
  }

  if (period === "monthly") {
    return { period, data: await getMonthlyRevenue() };
  }

  return { period, data: await getYearlyRevenue() };
};

// §9 Reporting — active/Starter/paid vendor counts. starterVendors +
// paidVendors should always sum to activeVendors, since every active
// vendor is on exactly one of the two categories.
module.exports.getVendorCountsReport = async () => {
  const [activeVendors, starterVendors, paidVendors] = await Promise.all([
    countActiveVendors(),
    countActiveVendorsOnDefaultPlan(true),
    countActiveVendorsOnDefaultPlan(false),
  ]);

  return { activeVendors, starterVendors, paidVendors };
};

// §9 Reporting — pending/approved/rejected counts, the latter two
// filterable by date range.
module.exports.getRequestsReport = async ({ status, from, to, offset, limit }) => {
  if (status) {
    const { rows, total } = await getRequestsByStatusAndDateRange({ status, from, to, offset, limit });
    return { status, count: total, data: rows };
  }

  const [pending, approved, rejected] = await Promise.all([
    countRequestsByStatus("pending"),
    countRequestsByStatus("approved"),
    countRequestsByStatus("rejected"),
  ]);

  return { pending, approved, rejected };
};

// §9 Reporting — expired count plus upcoming-expiration counts at the same
// 7-day/3-day windows used for the pre-expiry notifications (§10).
module.exports.getExpirationsReport = async () => {
  const [expiredCount, in7Days, in3Days] = await Promise.all([
    countSubscriptionsByStatus("expired"),
    countExpiringWithin(7),
    countExpiringWithin(3),
  ]);

  return { expiredCount, upcoming: { in7Days, in3Days } };
};
