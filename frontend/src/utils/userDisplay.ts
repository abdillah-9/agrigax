import type { User } from "../types/api.types";

export function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function roleLabel(role: string) {
  if (role === "provider") return "Service Provider";
  if (role === "admin") return "Administrator";
  return "Customer";
}

export function displayName(user: User | null) {
  if (!user) return "User";
  return user.fullName?.trim() || user.username;
}

export function profilePath(userType: "admin" | "customer" | "provider") {
  if (userType === "admin") return "/admin/profile";
  if (userType === "provider") return "/provider/profile";
  return "/app/profile";
}

export function settingsPath(userType: "admin" | "customer" | "provider") {
  if (userType === "admin") return "/admin/settings";
  if (userType === "provider") return "/provider/settings";
  return "/app/settings";
}
