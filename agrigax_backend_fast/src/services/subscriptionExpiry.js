const db = require("../configs/db");
const AppError = require("../errors/AppError");
const {
  findExpiredActive,
  findExpiringOnDate,
  setSubscriptionStatus,
  insertVendorSubscription,
} = require("../repositories/vendorSubscriptions");
const { findDefaultPlan } = require("../repositories/subscriptionPlans");
const { createNotification, hasNotificationToday } = require("../repositories/notifications");

// requirements §7 — the only polling process in the system. Each vendor's
// expire-and-fallback runs in its own transaction, not one transaction for
// the whole batch, so one vendor's failure doesn't block the rest
// (docs/05-testing-strategy.md §6).
module.exports.runExpiryJob = async () => {
  const expiredRows = await findExpiredActive();
  let processed = 0;
  let failed = 0;

  for (const row of expiredRows) {
    try {
      await db.transaction(async (trx) => {
        // §7 point 2-3: mark expired, then — in the same transaction —
        // create the permanent Starter fallback row. Resolved decisions
        // §12.1/§12.2: automatic, permanent fallback, never lockout.
        await setSubscriptionStatus(trx, row.id, "expired");

        const defaultPlan = await findDefaultPlan(trx);

        if (!defaultPlan) {
          throw new AppError("No default vendor plan configured — cannot fall back to Starter", 500);
        }

        await insertVendorSubscription(trx, {
          vendor_id: row.vendor_id,
          plan_id: defaultPlan.id,
          status: "active",
          start_date: trx.fn.now(),
          end_date: null,
          created_from_request_id: null,
        });
      });

      await createNotification({
        user_id: row.vendor_id,
        title: "Subscription expired",
        body: "Your subscription has expired. You have been moved back to the Starter plan.",
        type: "system",
        is_read: false,
      });

      processed += 1;
    } catch (e) {
      failed += 1;
      // One vendor's failure must not abort the batch or roll back
      // vendors already processed in earlier iterations.
      console.error(`[subscriptionExpiry] failed to expire vendor_subscriptions row ${row.id}:`, e.message);
    }
  }

  return { found: expiredRows.length, processed, failed };
};

const PRE_EXPIRY_THRESHOLDS = [
  { days: 7, title: "Subscription expires in 7 days" },
  { days: 3, title: "Subscription expires in 3 days" },
];

// §7 point 4: a separate scheduled check from runExpiryJob, not something
// detected only at the moment of expiry.
module.exports.runPreExpiryCheck = async () => {
  let sent = 0;

  for (const { days, title } of PRE_EXPIRY_THRESHOLDS) {
    const rows = await findExpiringOnDate(days);

    for (const row of rows) {
      const alreadySent = await hasNotificationToday(row.vendor_id, title);

      if (alreadySent) continue;

      await createNotification({
        user_id: row.vendor_id,
        title,
        body: `Your subscription expires in ${days} days. Renew soon to keep your current plan's features.`,
        type: "system",
        is_read: false,
      });

      sent += 1;
    }
  }

  return { sent };
};
