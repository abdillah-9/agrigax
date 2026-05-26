import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

import AdminDashboard from "../features/admin/pages/Dashboard";
import Users from "../features/admin/pages/Users";
import Providers from "../features/admin/pages/Providers";
import Roles from "../features/admin/pages/Roles";
import SuspendedUsers from "../features/admin/pages/SuspendedUsers";
import ListingsApproval from "../features/admin/pages/ListingsApproval";
import Categories from "../features/admin/pages/Categories";
import FeaturedListings from "../features/admin/pages/FeaturedListings";
import Bookings from "../features/admin/pages/Bookings";
import BookingDisputes from "../features/admin/pages/BookingDisputes";
import Payments from "../features/admin/pages/Payments";
import Commissions from "../features/admin/pages/Commissions";
import Refunds from "../features/admin/pages/Refunds";
import Reviews from "../features/admin/pages/Reviews";
import ReportedReviews from "../features/admin/pages/ReportedReviews";
import Announcements from "../features/admin/pages/Announcements";
import PushNotifications from "../features/admin/pages/PushNotifications";
import Banners from "../features/admin/pages/Banners";
import Advertisements from "../features/admin/pages/Advertisements";
import FAQs from "../features/admin/pages/FAQs";
import AuditLogs from "../features/admin/pages/AuditLogs";
import FraudMonitoring from "../features/admin/pages/FraudMonitoring";
import SystemLogs from "../features/admin/pages/SystemLogs";
import Reports from "../features/admin/pages/Reports";
import Analytics from "../features/admin/pages/Analytics";
import RevenueReports from "../features/admin/pages/RevenueReports";
import UserAnalytics from "../features/admin/pages/UserAnalytics";
import PerformanceReports from "../features/admin/pages/PerformanceReports";
import Settings from "../features/admin/pages/Settings";
import Profile from "../features/admin/pages/Profile";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="providers" element={<Providers />} />
        <Route path="roles" element={<Roles />} />
        <Route path="suspended-users" element={<SuspendedUsers />} />
        <Route path="listings" element={<ListingsApproval />} />
        <Route path="categories" element={<Categories />} />
        <Route path="featured-listings" element={<FeaturedListings />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="booking-disputes" element={<BookingDisputes />} />
        <Route path="payments" element={<Payments />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="reported-reviews" element={<ReportedReviews />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="push-notifications" element={<PushNotifications />} />
        <Route path="banners" element={<Banners />} />
        <Route path="ads" element={<Advertisements />} />
        <Route path="faqs" element={<FAQs />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="fraud-monitoring" element={<FraudMonitoring />} />
        <Route path="system-logs" element={<SystemLogs />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="revenue-reports" element={<RevenueReports />} />
        <Route path="user-analytics" element={<UserAnalytics />} />
        <Route path="performance-reports" element={<PerformanceReports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
