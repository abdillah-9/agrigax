import type { MenuItem } from "./types";

export const customerMenu: MenuItem[] = [
  { label: "Dashboard", path: "/app" },
  { label: "Browse Listings", path: "/app/listings" },
  { label: "Bookings", path: "/app/bookings" },
  { label: "Favorites", path: "/app/favorites" },
  { label: "Wallet", path: "/app/wallet" },
  { label: "Messages", path: "/app/messages" },
  { label: "Notifications", path: "/app/notifications" },
  {
    label: "Account",
    children: [
      { label: "Profile", path: "/app/profile" },
      { label: "Settings", path: "/app/settings" },
    ],
  },
];
