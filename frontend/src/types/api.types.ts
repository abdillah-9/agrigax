// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: string;
  isVerified: boolean;
}

// Auth
export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  fullName: string;
  phone: string;
  email?: string | null;
  password: string;
  role: "customer" | "provider";
}

export interface AuthResponse {
  user: User;
  requiresVerification?: boolean;
  devOtp?: string;
}

export interface DevOtpResponse {
  devOtp?: string;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  purpose?: "registration" | "password_reset";
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword: string;
}

// Listings
export interface Listing {
  id: string;
  title: string;
  description: string;
  type: string;
  categoryId: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  /** Only present when browsing in nearby mode */
  distanceKm: number | null;
  price: number;
  isAvailable: boolean;
  isApproved: boolean;
  providerId: string | null;
  ratingAvg: number;
  ratingCount: number;
  views: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Curated image catalog (no user uploads — vendors pick from these)
export interface CatalogImage {
  id: string;
  name: string;
  keywords: string | null;
  categoryId: string | null;
  url: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CatalogRequestStatus = "pending" | "added" | "dismissed";

export interface CatalogImageRequest {
  id: string;
  term: string;
  hits: number;
  requested: boolean;
  lastVendorId: string | null;
  status: CatalogRequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogImagePayload {
  name: string;
  keywords?: string;
  url: string;
  isActive?: boolean;
}

// Vendor-level rating (customer rates a provider after a booking)
export interface ProviderRating {
  average: number;
  count: number;
  myRating: number | null;
  canRate: boolean;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  type: string;
  categoryId: number;
  price: number;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  isAvailable: boolean;
  images?: string[];
}

export interface UpdateListingPayload extends Partial<CreateListingPayload> {}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
}

// Bookings
export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface BookingContact {
  name: string;
  phone: string | null;
}

export interface Booking {
  id: string;
  listingId: string;
  customerId: string;
  providerId: string;
  status: BookingStatus;
  scheduledAt: string | null;
  notes: string | null;
  /** Present only once the booking is accepted or completed */
  customerContact?: BookingContact | null;
  providerContact?: BookingContact | null;
  createdAt: string;
  updatedAt?: string;
}

export interface EnrichedBooking extends Booking {
  serviceTitle: string;
  location: string;
  price: number;
  providerName: string;
  customerName: string;
}

export interface CreateBookingPayload {
  listingId: string;
  date: string;
  notes?: string;
}

// Subscriptions — vendor plans, payment instructions, manual payment requests
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  isDefaultVendorPlan: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethodType = "mobile_money" | "bank_account" | "other";

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  accountName: string | null;
  accountNumber: string | null;
  phoneNumber: string | null;
  instructions: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SubscriptionRequestStatus = "pending" | "approved" | "rejected" | "expired";

export interface SubscriptionRequest {
  id: string;
  vendorId: string;
  planId: string;
  paymentMethodId: string;
  amount: number;
  transactionReference: string;
  receiptUrl: string | null;
  notes: string | null;
  status: SubscriptionRequestStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionRequestLog {
  id: string;
  requestId: string;
  adminId: string;
  action: "approved" | "rejected";
  comment: string | null;
  createdAt: string;
}

export interface SubscriptionRequestDetail extends SubscriptionRequest {
  logs: SubscriptionRequestLog[];
}

export type VendorSubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export interface VendorSubscription {
  id: string;
  vendorId: string;
  planId: string;
  status: VendorSubscriptionStatus;
  startDate: string;
  endDate: string | null;
  createdFromRequestId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CurrentSubscription extends VendorSubscription {
  plan: SubscriptionPlan | null;
}

export interface CreateSubscriptionRequestPayload {
  planId: string;
  paymentMethodId: string;
  amount: number;
  transactionReference: string;
  receiptUrl?: string;
  notes?: string;
}

export interface SubscriptionPlanPayload {
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  isDefaultVendorPlan?: boolean;
  isActive?: boolean;
}

export interface PaymentMethodPayload {
  name: string;
  type: PaymentMethodType;
  accountName?: string;
  accountNumber?: string;
  phoneNumber?: string;
  instructions?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface RevenueReport {
  period: "total" | "monthly" | "yearly";
  total?: number;
  data?: { period: string | number; revenue: number }[];
}

export interface VendorCountsReport {
  activeVendors: number;
  starterVendors: number;
  paidVendors: number;
}

export interface RequestCountsReport {
  pending: number;
  approved: number;
  rejected: number;
}

export interface ExpirationsReport {
  expiredCount: number;
  upcoming: { in7Days: number; in3Days: number };
}

// Users
export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateSettingsPayload {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  twoFactorAuth?: boolean;
}

// Favorites
export interface FavoriteListingSummary {
  title: string;
  price: number;
  location: string;
  type: string;
}

export interface Favorite {
  id: string;
  listingId: string;
  createdAt: string;
  listing?: FavoriteListingSummary;
}

// Reviews
export interface Review {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface EnrichedReview extends Review {
  authorName: string;
}

export interface CreateReviewPayload {
  listingId: string;
  rating: number;
  comment?: string;
}

// Messages
export interface Conversation {
  id: string;
  listingId: string | null;
  userOneId: string;
  userTwoId: string;
  otherUserId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessagePayload {
  text: string;
}

export interface StartConversationPayload {
  userTwoId: string;
  listingId?: string | null;
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "booking" | "payment" | "message" | "system" | "promotion";
  isRead: boolean;
  createdAt: string;
}

// Admin
export interface AdminUser extends User {
  isSuspended: boolean;
  createdAt: string;
}

export interface AdminDashboardStats {
  users: number;
  listings: number;
  bookings: number;
  categories: number;
  reviews: number;
  pendingListings: number;
  openDisputes: number;
  conversations: number;
}

export interface AdminBooking {
  id: string;
  listingId: string;
  customerId: string;
  providerId: string;
  status: string;
  displayStatus: string;
  scheduledAt: string | null;
  notes: string | null;
  createdAt: string;
  customerName: string | null;
  providerName: string | null;
  service: string | null;
  amount: number | null;
}

export interface AdminProvider {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  phone: string;
  isVerified: boolean;
  isSuspended: boolean;
  totalListings: number;
  createdAt: string;
}

export interface AdminConversation {
  id: string;
  listingId: string | null;
  userOneId: string;
  userTwoId: string;
  userOneName: string | null;
  userTwoName: string | null;
  listingTitle: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  raisedBy: string;
  reason: string;
  status: "open" | "under_review" | "resolved";
  resolutionNote: string | null;
  createdAt: string;
  customerId?: string | null;
  providerId?: string | null;
  listingTitle?: string | null;
  amount?: number;
}

export interface EnrichedDispute extends Dispute {
  customerName: string;
  providerName: string;
  serviceTitle: string;
  amount: number;
}

export interface EnrichedAdminReview extends Review {
  authorName: string;
  listingTitle: string;
  providerName: string;
}

export interface EnrichedPendingListing extends Listing {
  providerName: string;
  categoryName: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ResolveDisputePayload {
  status: "under_review" | "resolved";
  resolutionNote?: string;
}
