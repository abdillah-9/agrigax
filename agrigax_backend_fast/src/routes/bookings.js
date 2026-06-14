const express = require("express");
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  getDisputes,
  createDispute,
  resolveDispute,
} = require("../controllers/bookings");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const { guards } = require("../configs/accessPolicy");
const schemas = require("../validations/bookings");

const bookingsRouter = express.Router();

bookingsRouter.get("/disputes", ...guards.verified, asyncHandler(getDisputes));
bookingsRouter.post("/disputes", ...guards.verified, validate(schemas.createDispute), asyncHandler(createDispute));
bookingsRouter.put("/disputes/:id/resolve", ...guards.admin, validate(schemas.resolveDispute), asyncHandler(resolveDispute));

bookingsRouter.get("/my", ...guards.verified, asyncHandler(getMyBookings));
bookingsRouter.get("/provider", ...guards.provider, asyncHandler(getProviderBookings));
bookingsRouter.get("/:id", ...guards.verified, asyncHandler(getBookingById));
bookingsRouter.post("/", ...guards.verified, validate(schemas.create), asyncHandler(createBooking));
bookingsRouter.put("/:id/accept", ...guards.provider, asyncHandler(acceptBooking));
bookingsRouter.put("/:id/reject", ...guards.provider, asyncHandler(rejectBooking));
bookingsRouter.put("/:id/complete", ...guards.provider, asyncHandler(completeBooking));
bookingsRouter.put("/:id/cancel", ...guards.verified, asyncHandler(cancelBooking));

module.exports = bookingsRouter;
