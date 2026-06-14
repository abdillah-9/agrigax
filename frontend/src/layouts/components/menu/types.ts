export type MenuItem = {
  label: string;
  path?: string;
  icon?: string;
  requiresVerified?: boolean;
  children?: MenuItem[];
};
