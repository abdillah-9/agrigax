/**
 * Agrigax Phase 1 locked decisions — reference when building features.
 */
module.exports = {
  listings: {
    locationColumn: "location",
    locationMaxLength: 255,
    categoryInput: "category_id",
  },
  favorites: {
    target: "listing",
    note: "Provider followers = future provider_followers table",
  },
  admin: {
    v1Scope: [
      "users",
      "categories",
      "listings",
      "listing_approval",
      "bookings",
      "payments",
      "wallet",
      "messages",
      "disputes",
    ],
    deferred: ["faqs", "banners", "ads", "announcements", "2fa", "advanced_notification_settings"],
  },
  auth: {
    loginMethods: ["username", "phone", "email"],
    emailOptionalOnRegister: true,
    otpDelivery: "phone",
  },
};
