const AppError = require("../errors/AppError");
const { getListingById } = require("../repositories/listings");
const {
  createBooking,
  getBookingById,
  getBookingsForCustomer,
  getBookingsForProvider,
  updateBookingStatus,
  createDispute,
  getDisputes,
  getDisputeById,
  resolveDispute,
  getAllBookings,
  getOpenDisputeForBooking,
} = require("../repositories/bookings");
const { getUserById } = require("../repositories/auth");
const { formatBooking, formatDispute, formatAdminBooking } = require("../utils/formatters");

const parseListingId = (body) => Number(body.listing_id || body.listingId);

// Contact details are revealed to the two parties only after the vendor
// accepts — the booking is the bridge to the phone call, and hiding numbers
// until acceptance stops fake bookings made just to harvest phone numbers.
const CONTACT_STATUSES = ["accepted", "completed"];

const contactOf = (user) => (user ? { name: user.full_name, phone: user.phone } : null);

const formatWithContact = async (booking) => {
  const formatted = formatBooking(booking);

  if (!CONTACT_STATUSES.includes(booking.status)) {
    return formatted;
  }

  const [customer, provider] = await Promise.all([
    getUserById(booking.customer_id),
    getUserById(booking.provider_id),
  ]);

  return {
    ...formatted,
    customerContact: contactOf(customer),
    providerContact: contactOf(provider),
  };
};

module.exports.createCustomerBooking = async (customerId, body) => {
  const listingId = parseListingId(body);

  const listing = await getListingById(listingId, { publicOnly: true });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  if (Number(listing.provider_id) === Number(customerId)) {
    throw new AppError("You cannot book your own listing", 400);
  }

  const booking = await createBooking({
    listing_id: listingId,
    customer_id: customerId,
    provider_id: listing.provider_id,
    scheduled_at: body.scheduled_at || body.date || null,
    notes: body.notes || null,
    status: "pending",
  });

  return formatBooking(booking);
};

module.exports.getMyBookings = async (customerId) => {
  const rows = await getBookingsForCustomer(customerId);
  return Promise.all(rows.map(formatWithContact));
};

module.exports.getProviderBookings = async (providerId) => {
  const rows = await getBookingsForProvider(providerId);
  return Promise.all(rows.map(formatWithContact));
};

const assertBookingParty = (booking, userId) => {
  const allowed =
    Number(booking.customer_id) === Number(userId) ||
    Number(booking.provider_id) === Number(userId);

  if (!allowed) {
    throw new AppError("You do not have permission to perform this action", 403);
  }
};

module.exports.getBooking = async (id, viewerId) => {
  const booking = await getBookingById(id);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // Only the customer or the vendor on this booking may view it —
  // it now carries phone numbers.
  assertBookingParty(booking, viewerId);

  return formatWithContact(booking);
};

module.exports.acceptBooking = async (providerId, id) => {
  const booking = await getBookingById(id);

  if (!booking) throw new AppError("Booking not found", 404);
  if (Number(booking.provider_id) !== Number(providerId)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }
  if (booking.status !== "pending") {
    throw new AppError("Booking cannot be accepted in its current state", 400);
  }

  const updated = await updateBookingStatus(id, "accepted");
  return formatWithContact(updated);
};

module.exports.rejectBooking = async (providerId, id) => {
  const booking = await getBookingById(id);

  if (!booking) throw new AppError("Booking not found", 404);
  if (Number(booking.provider_id) !== Number(providerId)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }
  if (booking.status !== "pending") {
    throw new AppError("Booking cannot be rejected in its current state", 400);
  }

  const updated = await updateBookingStatus(id, "rejected");
  return formatBooking(updated);
};

module.exports.completeBooking = async (providerId, id) => {
  const booking = await getBookingById(id);

  if (!booking) throw new AppError("Booking not found", 404);
  if (Number(booking.provider_id) !== Number(providerId)) {
    throw new AppError("You do not have permission to perform this action", 403);
  }
  if (booking.status !== "accepted") {
    throw new AppError("Booking cannot be completed in its current state", 400);
  }

  const updated = await updateBookingStatus(id, "completed");
  return formatWithContact(updated);
};

module.exports.cancelBooking = async (userId, id) => {
  const booking = await getBookingById(id);

  if (!booking) throw new AppError("Booking not found", 404);
  assertBookingParty(booking, userId);

  if (!["pending", "accepted"].includes(booking.status)) {
    throw new AppError("Booking cannot be cancelled in its current state", 400);
  }

  const updated = await updateBookingStatus(id, "cancelled");
  return formatBooking(updated);
};

module.exports.raiseDispute = async (userId, body) => {
  const bookingId = Number(body.booking_id || body.bookingId);
  const booking = await getBookingById(bookingId);

  if (!booking) throw new AppError("Booking not found", 404);
  assertBookingParty(booking, userId);

  const dispute = await createDispute({
    booking_id: bookingId,
    raised_by: userId,
    reason: body.reason,
    status: "open",
  });

  return formatDispute(dispute);
};

module.exports.listDisputes = async (userId) => {
  const rows = await getDisputes();
  const bookings = await Promise.all(rows.map((d) => getBookingById(d.booking_id)));
  const bookingMap = Object.fromEntries(bookings.filter(Boolean).map((b) => [b.id, b]));

  return rows
    .filter((row) => {
      const booking = bookingMap[row.booking_id];
      if (!booking) return false;
      return (
        Number(booking.customer_id) === Number(userId) ||
        Number(booking.provider_id) === Number(userId)
      );
    })
    .map(formatDispute);
};

module.exports.getAllDisputes = async () => {
  const rows = await getDisputes();

  return Promise.all(
    rows.map(async (row) => {
      const booking = await getBookingById(row.booking_id);
      const listing = booking
        ? await getListingById(booking.listing_id, { publicOnly: false })
        : null;

      return {
        ...formatDispute(row),
        customerId: booking ? String(booking.customer_id) : null,
        providerId: booking ? String(booking.provider_id) : null,
        listingTitle: listing?.title ?? null,
        amount: listing ? Number(listing.price) : 0,
      };
    })
  );
};

module.exports.resolveBookingDispute = async (id, body) => {
  const dispute = await getDisputeById(id);

  if (!dispute) throw new AppError("Dispute not found", 404);

  const updated = await resolveDispute(id, {
    status: body.status,
    resolution_note: body.resolution_note || body.resolutionNote || null,
  });

  return formatDispute(updated);
};

const enrichAdminBooking = async (booking) => {
  const [listing, customer, provider, dispute] = await Promise.all([
    getListingById(booking.listing_id, { publicOnly: false }),
    getUserById(booking.customer_id),
    getUserById(booking.provider_id),
    getOpenDisputeForBooking(booking.id),
  ]);

  return formatAdminBooking(booking, {
    customerName: customer?.full_name ?? null,
    providerName: provider?.full_name ?? null,
    service: listing?.title ?? null,
    amount: listing ? Number(listing.price) : null,
    displayStatus: dispute ? "disputed" : booking.status,
  });
};

module.exports.adminListBookings = async ({ offset, limit, status }) => {
  const filterStatus = status === "disputed" ? null : status;
  const { rows, total } = await getAllBookings({ offset, limit, status: filterStatus });

  let enriched = await Promise.all(rows.map(enrichAdminBooking));

  if (status === "disputed") {
    enriched = enriched.filter((booking) => booking.displayStatus === "disputed");
  }

  return { data: enriched, total: status === "disputed" ? enriched.length : total };
};

module.exports.adminGetBooking = async (id) => {
  const booking = await getBookingById(id);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return enrichAdminBooking(booking);
};
