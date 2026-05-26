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

// Auth
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "provider";
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

// Listings
export interface CreateListingPayload {
  title: string;
  description: string;
  type: string;
  category: string;
  price: number;
  location: string;
  isAvailable: boolean;
}

export interface UpdateListingPayload extends Partial<CreateListingPayload> {}

// Bookings
export interface CreateBookingPayload {
  listingId: string;
  date: string;
  notes?: string;
}

// Payments
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
  location?: string;
  avatar?: string;
}

export interface UpdateSettingsPayload {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  twoFactorAuth?: boolean;
}

// Messages
export interface SendMessagePayload {
  text: string;
}
