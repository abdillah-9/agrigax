const db = require("../configs/db");

module.exports.createBooking = async (data) => {
  const [id] = await db("bookings").insert(data);
  return db("bookings").where({ id }).first();
};

module.exports.getBookingById = async (id) => {
  return db("bookings").where({ id }).first();
};

module.exports.getBookingsForCustomer = async (customer_id) => {
  return db("bookings").where({ customer_id }).orderBy("created_at", "desc");
};

module.exports.getBookingsForProvider = async (provider_id) => {
  return db("bookings").where({ provider_id }).orderBy("created_at", "desc");
};

module.exports.updateBookingStatus = async (id, status) => {
  await db("bookings").where({ id }).update({ status, updated_at: db.fn.now() });
  return module.exports.getBookingById(id);
};

module.exports.countBookings = async () => {
  const [{ count }] = await db("bookings").count({ count: "*" });
  return Number(count);
};

module.exports.createDispute = async (data) => {
  const [id] = await db("disputes").insert(data);
  return db("disputes").where({ id }).first();
};

module.exports.getDisputes = async () => {
  return db("disputes").orderBy("created_at", "desc");
};

module.exports.getDisputeById = async (id) => {
  return db("disputes").where({ id }).first();
};

module.exports.resolveDispute = async (id, updates) => {
  await db("disputes").where({ id }).update({ ...updates, updated_at: db.fn.now() });
  return module.exports.getDisputeById(id);
};

module.exports.countOpenDisputes = async () => {
  const [{ count }] = await db("disputes").where({ status: "open" }).count({ count: "*" });
  return Number(count);
};
