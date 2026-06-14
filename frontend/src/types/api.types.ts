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
  price: number;
  isAvailable: boolean;
  isApproved: boolean;
  providerId: string | null;
  ratingAvg: number;
  ratingCount: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  type: string;
  categoryId: number;
  price: number;
  location: string;
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

export interface Booking {
  id: string;
  listingId: string;
  customerId: string;
  providerId: string;
  status: BookingStatus;
  scheduledAt: string | null;
  notes: string | null;
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

// Payments / Wallet
export interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

export interface DepositPayload {
  amount: number;
  method: string;
  phone: string;
}

export interface WithdrawPayload {
  amount: number;
  method: string;
  phone: string;
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
