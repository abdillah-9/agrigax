import type { MenuItem } from "./types";

export const providerMenu: MenuItem[] = [
  { label: "Dashboard", path: "/provider" },
  { label: "Browse Listings", path: "/provider/browse" },
  { label: "My Listings", path: "/provider/listings" },
  { label: "Bookings", path: "/provider/bookings", requiresVerified: true },
  { label: "Earnings", path: "/provider/earnings", requiresVerified: true },
  { label: "Messages", path: "/provider/messages", requiresVerified: true },
  { label: "Notifications", path: "/provider/notifications" },
  {
    label: "Analytics",
    children: [
      { label: "Overview", path: "/provider/analytics" },
      { label: "Availability", path: "/provider/availability" },
    ],
  },
  {
    label: "Account",
    children: [
      { label: "Profile", path: "/provider/profile" },
      { label: "Settings", path: "/provider/settings" },
    ],
  },
];
