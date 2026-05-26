import { Navigate } from "react-router-dom";

type Role = "customer" | "provider" | "admin";

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[]; // optional now
}

export default function ProtectedRoutes({ children, allowedRoles }: Props) {

  const user = {
    role: "customer" as Role, // replace later with context/auth
  };

  // ❌ no user
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ✅ if no restriction → allow ALL logged-in users
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // ✅ role allowed check
  // const isAllowed = allowedRoles.includes(user.role);

  // if (!isAllowed) {
  //   return <Navigate to="/login" />;
  // }

  return <>{children}</>;
}