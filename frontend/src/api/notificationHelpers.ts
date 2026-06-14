import type { Notification } from "../types/api.types";

export type NotificationUiType = "success" | "warning" | "info";

export function notificationUiType(type: Notification["type"]): NotificationUiType {
  switch (type) {
    case "booking":
    case "payment":
      return "success";
    case "promotion":
      return "warning";
    case "message":
    case "system":
    default:
      return "info";
  }
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function notificationStats(notifications: Notification[]) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;
  return { unreadCount, readCount, total: notifications.length };
}
