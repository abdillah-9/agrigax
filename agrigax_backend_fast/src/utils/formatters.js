module.exports.formatCategory = (category) => ({
  id: String(category.id),
  name: category.name,
  slug: category.slug,
  description: category.description,
  isActive: Boolean(category.is_active),
});

module.exports.formatListing = (listing, images = []) => ({
  id: String(listing.id),
  title: listing.title,
  description: listing.description,
  type: listing.type,
  categoryId: listing.category_id ? String(listing.category_id) : null,
  location: listing.location,
  latitude: listing.latitude !== null && listing.latitude !== undefined ? Number(listing.latitude) : null,
  longitude: listing.longitude !== null && listing.longitude !== undefined ? Number(listing.longitude) : null,
  distanceKm:
    listing.distance_km !== null && listing.distance_km !== undefined
      ? Math.round(Number(listing.distance_km) * 10) / 10
      : null,
  price: Number(listing.price),
  isAvailable: Boolean(listing.is_available),
  isApproved: Boolean(listing.is_approved),
  providerId: listing.provider_id ? String(listing.provider_id) : null,
  ratingAvg: Number(listing.rating_avg || 0),
  ratingCount: Number(listing.rating_count || 0),
  views: Number(listing.views || 0),
  images: images.map((img) => img.url),
  createdAt: listing.created_at,
  updatedAt: listing.updated_at,
});

module.exports.formatCatalogImage = (image) => ({
  id: String(image.id),
  name: image.name,
  keywords: image.keywords,
  categoryId: image.category_id ? String(image.category_id) : null,
  url: image.url,
  isActive: Boolean(image.is_active),
  createdAt: image.created_at,
  updatedAt: image.updated_at,
});

module.exports.formatCatalogImageRequest = (request) => ({
  id: String(request.id),
  term: request.term,
  hits: Number(request.hits),
  requested: Boolean(request.requested),
  lastVendorId: request.last_vendor_id ? String(request.last_vendor_id) : null,
  status: request.status,
  createdAt: request.created_at,
  updatedAt: request.updated_at,
});

module.exports.formatBooking = (booking) => ({
  id: String(booking.id),
  listingId: String(booking.listing_id),
  customerId: String(booking.customer_id),
  providerId: String(booking.provider_id),
  status: booking.status,
  scheduledAt: booking.scheduled_at,
  notes: booking.notes,
  createdAt: booking.created_at,
  updatedAt: booking.updated_at,
});

module.exports.formatFavorite = (row) => ({
  id: String(row.id),
  listingId: String(row.listing_id),
  createdAt: row.created_at,
});

module.exports.formatConversation = (row, viewerId = null) => ({
  id: String(row.id),
  listingId: row.listing_id ? String(row.listing_id) : null,
  userOneId: String(row.user_one_id),
  userTwoId: String(row.user_two_id),
  otherUserId:
    viewerId != null
      ? String(
          Number(row.user_one_id) === Number(viewerId)
            ? row.user_two_id
            : row.user_one_id
        )
      : null,
  lastMessageAt: row.last_message_at,
  createdAt: row.created_at,
});

module.exports.formatMessage = (row) => ({
  id: String(row.id),
  conversationId: String(row.conversation_id),
  senderId: String(row.sender_id),
  text: row.message,
  isRead: Boolean(row.is_read),
  createdAt: row.created_at,
});

module.exports.formatNotification = (row) => ({
  id: String(row.id),
  title: row.title,
  body: row.body,
  type: row.type,
  isRead: Boolean(row.is_read),
  createdAt: row.created_at,
});

module.exports.formatReview = (row) => ({
  id: String(row.id),
  listingId: String(row.listing_id),
  userId: String(row.user_id),
  rating: Number(row.rating),
  comment: row.comment,
  isApproved: Boolean(row.is_approved),
  createdAt: row.created_at,
});

module.exports.formatDispute = (row) => ({
  id: String(row.id),
  bookingId: String(row.booking_id),
  raisedBy: String(row.raised_by),
  reason: row.reason,
  status: row.status,
  resolutionNote: row.resolution_note,
  createdAt: row.created_at,
});

module.exports.formatAdminBooking = (booking, extras = {}) => ({
  ...module.exports.formatBooking(booking),
  customerName: extras.customerName ?? null,
  providerName: extras.providerName ?? null,
  service: extras.service ?? null,
  amount: extras.amount ?? null,
  displayStatus: extras.displayStatus ?? booking.status,
});

module.exports.formatAdminConversation = (row, extras = {}) => ({
  ...module.exports.formatConversation(row),
  userOneName: extras.userOneName ?? null,
  userTwoName: extras.userTwoName ?? null,
  listingTitle: extras.listingTitle ?? null,
});

module.exports.formatSubscriptionPlan = (plan) => ({
  id: String(plan.id),
  name: plan.name,
  description: plan.description,
  price: Number(plan.price),
  currency: plan.currency,
  durationDays: Number(plan.duration_days),
  features: typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features,
  limits: typeof plan.limits === "string" ? JSON.parse(plan.limits) : plan.limits,
  isDefaultVendorPlan: Boolean(plan.is_default_vendor_plan),
  isActive: Boolean(plan.is_active),
  createdAt: plan.created_at,
  updatedAt: plan.updated_at,
});

module.exports.formatPaymentMethod = (method) => ({
  id: String(method.id),
  name: method.name,
  type: method.type,
  accountName: method.account_name,
  accountNumber: method.account_number,
  phoneNumber: method.phone_number,
  instructions: method.instructions,
  displayOrder: Number(method.display_order),
  isActive: Boolean(method.is_active),
  createdAt: method.created_at,
  updatedAt: method.updated_at,
});

module.exports.formatSubscriptionRequest = (request) => ({
  id: String(request.id),
  vendorId: String(request.vendor_id),
  planId: String(request.plan_id),
  paymentMethodId: String(request.payment_method),
  amount: Number(request.amount),
  transactionReference: request.transaction_reference,
  receiptUrl: request.receipt_url,
  notes: request.notes,
  status: request.status,
  verifiedBy: request.verified_by ? String(request.verified_by) : null,
  verifiedAt: request.verified_at,
  createdAt: request.created_at,
  updatedAt: request.updated_at,
});

module.exports.formatSubscriptionRequestLog = (log) => ({
  id: String(log.id),
  requestId: String(log.request_id),
  adminId: String(log.admin_id),
  action: log.action,
  comment: log.comment,
  createdAt: log.created_at,
});

module.exports.formatVendorSubscription = (subscription) => ({
  id: String(subscription.id),
  vendorId: String(subscription.vendor_id),
  planId: String(subscription.plan_id),
  status: subscription.status,
  startDate: subscription.start_date,
  endDate: subscription.end_date,
  createdFromRequestId: subscription.created_from_request_id
    ? String(subscription.created_from_request_id)
    : null,
  createdAt: subscription.created_at,
  updatedAt: subscription.updated_at,
});

module.exports.formatAdminProvider = (user) => ({
  id: String(user.id),
  username: user.username,
  fullName: user.full_name,
  email: user.email || null,
  phone: user.phone,
  isVerified: Boolean(user.is_verified),
  isSuspended: Boolean(user.is_suspended),
  totalListings: Number(user.total_listings || 0),
  createdAt: user.created_at,
});
