import { Routes, Route, Navigate } from "react-router-dom";

import AuthRoutes from "./auth";
import CustomerRoutes from "./customer";
import ProviderRoutes from "./provider";
import AdminRoutes from "./admin";

import ProtectedRoutes from "./protectedRoutes";

export default function RouteIndex() {
  return (
    <Routes>

      {/* AUTH */}
      <Route path="/*" element={<AuthRoutes />} />

      {/* CUSTOMER */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoutes allowedRoles={["customer"]}>
            <CustomerRoutes />
          </ProtectedRoutes>
        }
      />

      {/* PROVIDER */}
      <Route
        path="/provider/*"
        element={
          <ProtectedRoutes allowedRoles={["provider"]}>
            <ProviderRoutes />
          </ProtectedRoutes>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoutes allowedRoles={["admin"]}>
            <AdminRoutes />
          </ProtectedRoutes>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}