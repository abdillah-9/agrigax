import type { Booking, EnrichedBooking, Listing } from "../types/api.types";
import { userInitials } from "../utils/userDisplay";

export function formatCompactCurrency(amount: number, currency = "TZS") {
  if (amount >= 1_000_000) {
    const value = amount / 1_000_000;
    return `${currency} ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${currency} ${Math.round(amount / 1_000)}K`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export function dashboardBadgeClass(status: Booking["status"]) {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "accepted":
      return "info";
    case "rejected":
    case "cancelled":
      return "default";
    default:
      return "default";
  }
}

export function sortBookingsNewest<T extends { createdAt: string; scheduledAt?: string | null }>(
  bookings: T[]
) {
  return [...bookings].sort((a, b) =>
    (b.scheduledAt || b.createdAt).localeCompare(a.scheduledAt || a.createdAt)
  );
}

export function customerDashboardStats(bookings: EnrichedBooking[], favoriteCount: number) {
  const activeBookings = bookings.filter((b) => b.status === "accepted").length;
  return {
    activeBookings,
    favoriteCount,
  };
}

export function providerDashboardStats(bookings: EnrichedBooking[], listings: Listing[]) {
  const activeListings = listings.filter((l) => l.isAvailable && l.isApproved).length;
  const pendingApproval = listings.filter((l) => !l.isApproved).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const completedTotal = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.price, 0);

  return {
    currency: "TZS",
    activeListings,
    pendingApproval,
    pendingBookings,
    completedTotal,
  };
}

export function weeklyRevenueFromBookings(bookings: EnrichedBooking[]) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bars: { day: string; value: number; height: number }[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);

    const dayStart = day.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;

    const value = bookings
      .filter((b) => b.status === "completed")
      .filter((b) => {
        const ts = new Date(b.updatedAt || b.createdAt).getTime();
        return ts >= dayStart && ts <= dayEnd;
      })
      .reduce((sum, b) => sum + b.price, 0);

    bars.push({ day: dayLabels[day.getDay()], value, height: 0 });
  }

  const total = bars.reduce((sum, bar) => sum + bar.value, 0);
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return {
    total,
    bars: bars.map((bar) => ({
      ...bar,
      height: bar.value === 0 ? 4 : Math.round((bar.value / max) * 100),
    })),
  };
}

export function bookingCardInitials(name: string) {
  return userInitials(name);
}
