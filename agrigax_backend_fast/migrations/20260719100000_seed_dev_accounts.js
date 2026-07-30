// Dev/test accounts so a fresh database is immediately usable:
//   vendor1 / vendor2  -> provider role
//   user1   / user2    -> customer role
//   admin1             -> admin role
// All with password "1234567890", verified, not suspended.
//
// Because seeding bypasses the registration flow, the vendors' Starter
// subscription (requirements §5.1 — every vendor always has an active
// vendor_subscriptions row) is created here explicitly, exactly as
// assignDefaultPlan would: status=active, end_date=null (permanent),
// created_from_request_id=null. Customers and admins get no subscription row.
const bcrypt = require("bcrypt");

const PASSWORD = "1234567890";

const ACCOUNTS = [
  { username: "vendor1", full_name: "Vendor One", phone: "+255700000101", active_role: "provider" },
  { username: "vendor2", full_name: "Vendor Two", phone: "+255700000102", active_role: "provider" },
  { username: "user1", full_name: "User One", phone: "+255700000103", active_role: "customer" },
  { username: "user2", full_name: "User Two", phone: "+255700000104", active_role: "customer" },
  { username: "admin1", full_name: "Admin One", phone: "+255700000105", active_role: "admin" },
];

exports.up = async function (knex) {
  const password_hash = await bcrypt.hash(PASSWORD, 10);

  const defaultPlan = await knex("subscription_plans")
    .where({ is_default_vendor_plan: true })
    .first();

  if (!defaultPlan) {
    // The starter-plan seed migration runs before this one, so this only
    // happens if that row was deleted — fail loudly per §5.1 rather than
    // seeding vendors with no subscription.
    throw new Error("No default vendor plan found — run the Starter plan seed first");
  }

  for (const account of ACCOUNTS) {
    const existing = await knex("users").where({ username: account.username }).first();

    let userId;

    if (existing) {
      userId = existing.id;
      await knex("users").where({ id: userId }).update({
        full_name: account.full_name,
        active_role: account.active_role,
        is_verified: true,
        is_suspended: false,
        password_hash,
      });
    } else {
      const [id] = await knex("users").insert({
        username: account.username,
        full_name: account.full_name,
        phone: account.phone,
        email: null,
        password_hash,
        avatar: null,
        active_role: account.active_role,
        is_verified: true,
        is_suspended: false,
      });
      userId = id;
    }

    if (account.active_role === "provider") {
      const activeSubscription = await knex("vendor_subscriptions")
        .where({ vendor_id: userId, status: "active" })
        .first();

      if (!activeSubscription) {
        await knex("vendor_subscriptions").insert({
          vendor_id: userId,
          plan_id: defaultPlan.id,
          status: "active",
          start_date: knex.fn.now(),
          end_date: null,
          created_from_request_id: null,
        });
      }
    }
  }
};

exports.down = async function (knex) {
  const usernames = ACCOUNTS.map((a) => a.username);
  const users = await knex("users").whereIn("username", usernames).select("id");
  const ids = users.map((u) => u.id);

  if (ids.length) {
    await knex("vendor_subscriptions").whereIn("vendor_id", ids).del();
    await knex("users").whereIn("id", ids).del();
  }
};
