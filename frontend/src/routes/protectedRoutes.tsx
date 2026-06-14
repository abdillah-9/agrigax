import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

type Role = "customer" | "provider" | "admin";

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoutes({ children, allowedRoles }: Props) {
  const { user, loading, checkSession } = useAuthContext();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkSession().finally(() => setChecked(true));
  }, [checkSession]);

  if (!checked || loading) {
    return (
      <div style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role as Role)) {
    if (user.role === "provider") return <Navigate to="/provider" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
