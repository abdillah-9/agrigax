const bcrypt = require("bcrypt");

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const ADMIN_PHONE = "+255700000001";

exports.up = async function (knex) {
  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await knex("users").where({ username: ADMIN_USERNAME }).first();

  if (existing) {
    await knex("users").where({ id: existing.id }).update({
      full_name: "Dev Admin",
      active_role: "admin",
      is_verified: true,
      is_suspended: false,
      password_hash,
    });
    return;
  }

  await knex("users").insert({
    username: ADMIN_USERNAME,
    full_name: "Dev Admin",
    phone: ADMIN_PHONE,
    email: null,
    password_hash,
    avatar: null,
    active_role: "admin",
    is_verified: true,
    is_suspended: false,
  });
};

exports.down = async function (knex) {
  await knex("users").where({ username: ADMIN_USERNAME }).del();
};
