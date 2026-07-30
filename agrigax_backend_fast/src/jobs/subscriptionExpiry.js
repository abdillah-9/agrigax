const { runExpiryJob, runPreExpiryCheck } = require("../services/subscriptionExpiry");

// No cron dependency exists in this app today, so cadence is expressed as a
// plain interval rather than a cron expression (docs/06-deployment-guide.md
// treats exact cadence as an operational choice, not something the
// requirements doc mandates). Defaults: hourly expiry check, daily
// pre-expiry check — both configurable per environment.
const EXPIRY_INTERVAL_MS = Number(process.env.SUBSCRIPTION_EXPIRY_JOB_INTERVAL_MS) || 60 * 60 * 1000;
const PRE_EXPIRY_INTERVAL_MS = Number(process.env.SUBSCRIPTION_PRE_EXPIRY_JOB_INTERVAL_MS) || 24 * 60 * 60 * 1000;

let expiryTimer = null;
let preExpiryTimer = null;

const safeRun = (label, fn) => async () => {
  try {
    const result = await fn();
    console.log(`[jobs] ${label} ran:`, JSON.stringify(result));
  } catch (e) {
    console.error(`[jobs] ${label} failed:`, e.message);
  }
};

module.exports.startSubscriptionJobs = () => {
  const runExpiry = safeRun("subscription expiry", runExpiryJob);
  const runPreExpiry = safeRun("subscription pre-expiry check", runPreExpiryCheck);

  expiryTimer = setInterval(runExpiry, EXPIRY_INTERVAL_MS);
  preExpiryTimer = setInterval(runPreExpiry, PRE_EXPIRY_INTERVAL_MS);

  // Run once at boot too, rather than waiting a full interval for the first pass.
  runExpiry();
  runPreExpiry();
};

module.exports.stopSubscriptionJobs = () => {
  clearInterval(expiryTimer);
  clearInterval(preExpiryTimer);
};
