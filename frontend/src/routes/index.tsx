import { Routes, Route, Navigate } from "react-router-dom";

import AuthRoutes from "./auth";
import CustomerRoutes from "./customer";
import ProviderRoutes from "./provider";
import AdminRoutes from "./admin";

import ProtectedRoutes from "./protectedRoutes";

export default function RouteIndex() {
  return (
    <Routes>
      <Route path="/app/*" element={
        <ProtectedRoutes allowedRoles={["customer"]}>
          <CustomerRoutes />
        </ProtectedRoutes>
      } />

      <Route path="/provider/*" element={
        <ProtectedRoutes allowedRoles={["provider"]}>
          <ProviderRoutes />
        </ProtectedRoutes>
      } />

      <Route path="/admin/*" element={
        <ProtectedRoutes allowedRoles={["admin"]}>
          <AdminRoutes />
        </ProtectedRoutes>
      } />

      <Route path="/*" element={<AuthRoutes />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
