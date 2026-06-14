/**
 * Agrigax V1 access tiers
 *
 * PUBLIC       → visitors, no cookie required (browse listings, categories)
 * AUTH         → registered users (profile, settings, favorites, notifications)
 * VERIFIED     → OTP-verified users (bookings, messages, wallet, create/manage listings)
 * PROVIDER     → verified + active_role === "provider"
 * ADMIN        → active_role === "admin" (verification not required for admin ops)
 */

const { authenticate } = require("../middlewares/authenticate");
const { requireVerified } = require("../middlewares/requireVerified");
const { authorize } = require("../middlewares/authorize");

const ROLES = {
  CUSTOMER: "customer",
  PROVIDER: "provider",
  ADMIN: "admin",
};

const guards = {
  public: [],
  auth: [authenticate],
  verified: [authenticate, requireVerified],
  provider: [authenticate, requireVerified, authorize(ROLES.PROVIDER)],
  admin: [authenticate, authorize(ROLES.ADMIN)],
};

const routeAccess = {
  auth: {
    login: "public",
    register: "public",
    logout: "auth",
    refresh: "public",
    me: "auth",
    forgotPassword: "public",
    verifyOtp: "public",
    resetPassword: "public",
  },
  users: {
    profile: "auth",
    settings: "auth",
    providers: "public",
    byId: "public",
  },
  categories: {
    list: "public",
    byId: "public",
    create: "admin",
    update: "admin",
    delete: "admin",
  },
  listings: {
    list: "public",
    featured: "public",
    byCategory: "public",
    byId: "public",
    my: "provider",
    create: "provider",
    update: "provider",
    delete: "provider",
  },
  favorites: {
    list: "auth",
    toggle: "auth",
  },
  bookings: {
    list: "verified",
    my: "verified",
    provider: "provider",
    create: "verified",
    accept: "provider",
    reject: "provider",
    complete: "provider",
    cancel: "verified",
  },
  wallet: {
    balance: "verified",
    transactions: "verified",
    deposit: "verified",
    withdraw: "verified",
  },
  messages: {
    conversations: "verified",
    byId: "verified",
    send: "verified",
  },
  notifications: {
    list: "auth",
    markRead: "auth",
    markAll: "auth",
  },
  reviews: {
    list: "public",
    create: "verified",
    update: "verified",
    delete: "verified",
  },
  disputes: {
    list: "verified",
    create: "verified",
    resolve: "admin",
  },
  admin: {
    all: "admin",
  },
};

module.exports = {
  ROLES,
  guards,
  routeAccess,
};
