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
  price: Number(listing.price),
  isAvailable: Boolean(listing.is_available),
  isApproved: Boolean(listing.is_approved),
  providerId: listing.provider_id ? String(listing.provider_id) : null,
  ratingAvg: Number(listing.rating_avg || 0),
  ratingCount: Number(listing.rating_count || 0),
  images: images.map((img) => img.url),
  createdAt: listing.created_at,
  updatedAt: listing.updated_at,
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

module.exports.formatWallet = (wallet) => ({
  id: String(wallet.id),
  balance: Number(wallet.balance),
  currency: wallet.currency,
});

module.exports.formatTransaction = (tx) => ({
  id: String(tx.id),
  type: tx.type,
  amount: Number(tx.amount),
  reference: tx.reference,
  description: tx.description,
  createdAt: tx.created_at,
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

module.exports.formatPayment = (payment) => ({
  id: String(payment.id),
  bookingId: String(payment.booking_id),
  payerId: String(payment.payer_id),
  receiverId: String(payment.receiver_id),
  amount: Number(payment.amount),
  method: payment.method,
  status: payment.status === "paid" ? "completed" : payment.status,
  transactionRef: payment.transaction_ref,
  createdAt: payment.created_at,
});

module.exports.formatAdminBooking = (booking, extras = {}) => ({
  ...module.exports.formatBooking(booking),
  customerName: extras.customerName ?? null,
  providerName: extras.providerName ?? null,
  service: extras.service ?? null,
  amount: extras.amount ?? null,
  displayStatus: extras.displayStatus ?? booking.status,
});

module.exports.formatAdminTransaction = (row) => ({
  ...module.exports.formatTransaction(row),
  userId: String(row.user_id),
  userName: row.user_name,
  userUsername: row.user_username,
});

module.exports.formatAdminConversation = (row, extras = {}) => ({
  ...module.exports.formatConversation(row),
  userOneName: extras.userOneName ?? null,
  userTwoName: extras.userTwoName ?? null,
  listingTitle: extras.listingTitle ?? null,
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
