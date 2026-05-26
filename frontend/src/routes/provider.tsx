import { Routes, Route } from "react-router-dom";
import ProviderLayout from "../layouts/ProviderLayout";

import Dashboard from "../features/provider/pages/Dashboard";
import ListingsList from "../features/listings/pages/ListingsList";
import ListingDetails from "../features/listings/pages/ListingDetails";
import MyListings from "../features/listings/provider/MyListings";
import CreateListing from "../features/listings/provider/CreateListing";
import EditListing from "../features/listings/provider/EditListing";
import ProviderBookings from "../features/bookings/provider/ProviderBookings";
import MyBookings from "../features/bookings/pages/MyBookings";
import Earnings from "../features/provider/pages/Earnings";
import Analytics from "../features/provider/pages/Analytics";
import Availability from "../features/provider/pages/Availability";
import Notifications from "../features/notifications/pages/Notifications";
import Messages from "../features/chat/pages/Messages";
import ChatRoom from "../features/chat/pages/ChatRoom";
import Profile from "../features/provider/pages/Profile";
import Settings from "../features/provider/pages/Settings";

export default function ProviderRoutes() {
  return (
    <Routes>
      <Route element={<ProviderLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="browse" element={<ListingsList />} />
        <Route path="browse/:id" element={<ListingDetails />} />
        <Route path="listings" element={<MyListings />} />
        <Route path="listings/create" element={<CreateListing />} />
        <Route path="listings/edit/:id" element={<EditListing />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="availability" element={<Availability />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:id" element={<ChatRoom />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
