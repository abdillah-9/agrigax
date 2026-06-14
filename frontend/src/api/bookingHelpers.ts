import apiClient from "./client";
import { LISTINGS, USERS } from "./endpoints";
import type { ApiResponse, Booking, EnrichedBooking, Listing, User } from "../types/api.types";

function formatBookingDate(value: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatBookingAmount(price: number) {
  return `TZS ${price.toLocaleString()}`;
}

export { formatBookingDate };

export function bookingStatusClass(status: Booking["status"]) {
  switch (status) {
    case "pending":
      return "pending-status";
    case "accepted":
      return "confirmed-status";
    case "completed":
      return "confirmed-status";
    case "cancelled":
    case "rejected":
      return "pending-status";
    default:
      return "";
  }
}

export function providerStatusClass(status: Booking["status"]) {
  switch (status) {
    case "pending":
      return "booking-status-pending";
    case "accepted":
      return "booking-status-accepted";
    case "completed":
      return "booking-status-completed";
    case "cancelled":
    case "rejected":
      return "booking-status-cancelled";
    default:
      return "";
  }
}

const listingCache = new Map<string, Listing | null>();
const userCache = new Map<string, User | null>();

async function getListing(id: string) {
  if (listingCache.has(id)) return listingCache.get(id) ?? null;

  try {
    const { data } = await apiClient.get<ApiResponse<Listing>>(LISTINGS.BY_ID(id));
    listingCache.set(id, data.data);
    return data.data;
  } catch {
    listingCache.set(id, null);
    return null;
  }
}

async function getUser(id: string) {
  if (userCache.has(id)) return userCache.get(id) ?? null;

  try {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>(USERS.BY_ID(id));
    userCache.set(id, data.data.user);
    return data.data.user;
  } catch {
    userCache.set(id, null);
    return null;
  }
}

export async function enrichBookings(bookings: Booking[]): Promise<EnrichedBooking[]> {
  return Promise.all(
    bookings.map(async (booking) => {
      const [listing, provider, customer] = await Promise.all([
        getListing(booking.listingId),
        getUser(booking.providerId),
        getUser(booking.customerId),
      ]);

      return {
        ...booking,
        serviceTitle: listing?.title || `Listing #${booking.listingId}`,
        location: listing?.location || "—",
        price: listing?.price ?? 0,
        providerName: provider?.fullName || provider?.username || "Provider",
        customerName: customer?.fullName || customer?.username || "Customer",
      };
    })
  );
}

export function clearBookingLookupCache() {
  listingCache.clear();
  userCache.clear();
}
