export type UserRole =
  | "customer"
  | "provider"
  | "admin";

export interface User {
  id: string;

  fullName: string;

  email: string;

  phone?: string;

  avatar?: string;

  availableRoles: UserRole[];

  activeRole: UserRole;

  isVerified: boolean;

  isSuspended: boolean;

  createdAt: string;
}