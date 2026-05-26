import { Routes, Route } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout";

import Dashboard from "../features/customer/pages/Dashboard";
import ListingsList from "../features/listings/pages/ListingsList";
import ListingDetails from "../features/listings/pages/ListingDetails";
import Bookings from "../features/bookings/pages/MyBookings";
import Favorites from "../features/customer/pages/Favorites";
import Wallet from "../features/customer/pages/Wallet";
import Notifications from "../features/notifications/pages/Notifications";
import Messages from "../features/chat/pages/Messages";
import ChatRoom from "../features/chat/pages/ChatRoom";
import Profile from "../features/customer/pages/Profile";
import Settings from "../features/customer/pages/Settings";

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="listings" element={<ListingsList />} />
        <Route path="listings/:id" element={<ListingDetails />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:id" element={<ChatRoom />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
