// =====================================================
// AUTH
// =====================================================
export const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  ME: "/auth/me",
};

// =====================================================
// USERS
// =====================================================
export const USERS = {
  PROFILE: "/users/profile",
  SETTINGS: "/users/settings",
  PROVIDERS: "/users/providers",
  BY_ID: (id: string) => `/users/${id}`,
};

// =====================================================
// LISTINGS
// =====================================================
export const LISTINGS = {
  BASE: "/listings",
  MY: "/listings/my",
  FEATURED: "/listings/featured",
  BY_ID: (id: string) => `/listings/${id}`,
  BY_CATEGORY: (cat: string) => `/listings/category/${cat}`,
};

// =====================================================
// BOOKINGS
// =====================================================
export const BOOKINGS = {
  BASE: "/bookings",
  MY: "/bookings/my",
  PROVIDER: "/bookings/provider",
  BY_ID: (id: string) => `/bookings/${id}`,
  ACCEPT: (id: string) => `/bookings/${id}/accept`,
  REJECT: (id: string) => `/bookings/${id}/reject`,
  COMPLETE: (id: string) => `/bookings/${id}/complete`,
  CANCEL: (id: string) => `/bookings/${id}/cancel`,
  DISPUTES: "/bookings/disputes",
  RESOLVE_DISPUTE: (id: string) => `/bookings/disputes/${id}/resolve`,
};

// =====================================================
// WALLET
// =====================================================
export const WALLET = {
  BALANCE: "/wallet",
  TRANSACTIONS: "/wallet/transactions",
  DEPOSIT: "/wallet/deposit",
  WITHDRAW: "/wallet/withdraw",
};

// =====================================================
// FAVORITES
// =====================================================
export const FAVORITES = {
  BASE: "/favorites",
  TOGGLE: (id: string) => `/favorites/${id}`,
};

// =====================================================
// REVIEWS
// =====================================================
export const REVIEWS = {
  BASE: "/reviews",
  BY_ID: (id: string) => `/reviews/${id}`,
};

// =====================================================
// NOTIFICATIONS
// =====================================================
export const NOTIFICATIONS = {
  BASE: "/notifications",
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL: "/notifications/read-all",
};

// =====================================================
// MESSAGES
// =====================================================
export const MESSAGES = {
  CONVERSATIONS: "/messages/conversations",
  CREATE: "/messages/conversations",
  BY_ID: (id: string) => `/messages/${id}`,
  SEND: (id: string) => `/messages/${id}/send`,
};

// =====================================================
// ADMIN
// =====================================================
export const ADMIN = {
  DASHBOARD: "/admin/dashboard",
  USERS: "/admin/users",
  PROVIDERS: "/admin/providers",
  LISTINGS_PENDING: "/admin/listings/pending",
  APPROVE_LISTING: (id: string) => `/admin/listings/${id}/approve`,
  REJECT_LISTING: (id: string) => `/admin/listings/${id}/reject`,
  BOOKINGS: "/admin/bookings",
  BOOKING_BY_ID: (id: string) => `/admin/bookings/${id}`,
  CATEGORIES: "/admin/categories",
  CATEGORY_BY_ID: (id: string) => `/admin/categories/${id}`,
  PAYMENTS: "/admin/payments",
  REFUNDS: "/admin/refunds",
  TRANSACTIONS: "/admin/transactions",
  MESSAGES_CONVERSATIONS: "/admin/messages/conversations",
  MESSAGE_BY_ID: (id: string) => `/admin/messages/${id}`,
  FEATURED: "/admin/featured",
  DISPUTES: "/admin/disputes",
  RESOLVE_DISPUTE: (id: string) => `/admin/disputes/${id}/resolve`,
  REVIEWS: "/admin/reviews",
  APPROVE_REVIEW: (id: string) => `/admin/reviews/${id}/approve`,
  HIDE_REVIEW: (id: string) => `/admin/reviews/${id}/hide`,
  DELETE_REVIEW: (id: string) => `/admin/reviews/${id}`,
  REPORTED_REVIEWS: "/admin/reported-reviews",
  ANNOUNCEMENTS: "/admin/announcements",
  BANNERS: "/admin/banners",
  ADS: "/admin/ads",
  FAQS: "/admin/faqs",
  AUDIT_LOGS: "/admin/audit-logs",
  FRAUD_ALERTS: "/admin/fraud-alerts",
  SYSTEM_LOGS: "/admin/system-logs",
  ANALYTICS: "/admin/analytics",
  SETTINGS: "/admin/settings",
  SUSPEND_USER: (id: string) => `/admin/users/${id}/suspend`,
  REINSTATE_USER: (id: string) => `/admin/users/${id}/reinstate`,
};
