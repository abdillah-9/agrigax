const {
  createCustomerBooking,
  getMyBookings,
  getProviderBookings,
  getBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  raiseDispute,
  listDisputes,
  resolveBookingDispute,
} = require("../services/bookings");
const { sendSuccess } = require("../utils/response");

module.exports.createBooking = async (req, res, next) => {
  try {
    const data = await createCustomerBooking(req.user.id, req.body);
    return sendSuccess(res, data, "Booking created", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.getMyBookings = async (req, res, next) => {
  try {
    const data = await getMyBookings(req.user.id);
    return sendSuccess(res, data, "Bookings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getProviderBookings = async (req, res, next) => {
  try {
    const data = await getProviderBookings(req.user.id);
    return sendSuccess(res, data, "Provider bookings fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.getBookingById = async (req, res, next) => {
  try {
    const data = await getBooking(req.params.id);
    return sendSuccess(res, data, "Booking fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.acceptBooking = async (req, res, next) => {
  try {
    const data = await acceptBooking(req.user.id, req.params.id);
    return sendSuccess(res, data, "Booking accepted");
  } catch (e) {
    next(e);
  }
};

module.exports.rejectBooking = async (req, res, next) => {
  try {
    const data = await rejectBooking(req.user.id, req.params.id);
    return sendSuccess(res, data, "Booking rejected");
  } catch (e) {
    next(e);
  }
};

module.exports.completeBooking = async (req, res, next) => {
  try {
    const data = await completeBooking(req.user.id, req.params.id);
    return sendSuccess(res, data, "Booking completed");
  } catch (e) {
    next(e);
  }
};

module.exports.cancelBooking = async (req, res, next) => {
  try {
    const data = await cancelBooking(req.user.id, req.params.id);
    return sendSuccess(res, data, "Booking cancelled");
  } catch (e) {
    next(e);
  }
};

module.exports.getDisputes = async (req, res, next) => {
  try {
    const data = await listDisputes(req.user.id);
    return sendSuccess(res, data, "Disputes fetched");
  } catch (e) {
    next(e);
  }
};

module.exports.createDispute = async (req, res, next) => {
  try {
    const data = await raiseDispute(req.user.id, req.body);
    return sendSuccess(res, data, "Dispute raised", 201);
  } catch (e) {
    next(e);
  }
};

module.exports.resolveDispute = async (req, res, next) => {
  try {
    const data = await resolveBookingDispute(req.params.id, req.body);
    return sendSuccess(res, data, "Dispute updated");
  } catch (e) {
    next(e);
  }
};
