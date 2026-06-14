import apiClient from "./client";
import { LISTINGS, MESSAGES, USERS } from "./endpoints";
import type { ApiResponse, Conversation, Listing, Message, User } from "../types/api.types";
import { userInitials } from "../utils/userDisplay";
import { formatRelativeTime } from "./notificationHelpers";

export interface EnrichedConversation extends Conversation {
  otherUserName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function messagesBasePath(pathname: string) {
  if (pathname.startsWith("/provider")) return "/provider/messages";
  return "/app/messages";
}

async function fetchMessagesForConversation(conversationId: string) {
  const { data } = await apiClient.get<ApiResponse<Message[]>>(MESSAGES.BY_ID(conversationId));
  return data.data;
}

async function fetchUserById(id: string) {
  try {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>(USERS.BY_ID(id));
    return data.data.user;
  } catch {
    return null;
  }
}

async function fetchListingById(id: string) {
  try {
    const { data } = await apiClient.get<ApiResponse<Listing>>(LISTINGS.BY_ID(id));
    return data.data;
  } catch {
    return null;
  }
}

export async function enrichConversations(
  conversations: Conversation[],
  currentUserId: string
): Promise<EnrichedConversation[]> {
  return Promise.all(
    conversations.map(async (conv) => {
      const messages = await fetchMessagesForConversation(conv.id);
      const last = messages[messages.length - 1];
      const unread = messages.filter(
        (m) => !m.isRead && m.senderId !== currentUserId
      ).length;

      let otherUserId = conv.otherUserId;
      if (!otherUserId) {
        const otherMsg = messages.find((m) => m.senderId !== currentUserId);
        otherUserId = otherMsg?.senderId ?? null;
      }

      let otherUserName = "Conversation";
      if (otherUserId) {
        const user = await fetchUserById(otherUserId);
        otherUserName = user?.fullName?.trim() || user?.username || otherUserName;
      } else if (conv.listingId) {
        const listing = await fetchListingById(conv.listingId);
        if (listing) otherUserName = listing.title;
      }

      return {
        ...conv,
        otherUserName,
        avatar: userInitials(otherUserName),
        lastMessage: last?.text ?? "No messages yet",
        time: formatRelativeTime(last?.createdAt ?? conv.lastMessageAt ?? conv.createdAt),
        unread,
      };
    })
  );
}

export async function resolveChatPartner(
  conversation: Conversation | null,
  messages: Message[],
  currentUserId: string
) {
  let otherUserId = conversation?.otherUserId ?? null;
  if (!otherUserId) {
    const otherMsg = messages.find((m) => m.senderId !== currentUserId);
    otherUserId = otherMsg?.senderId ?? null;
  }

  if (otherUserId) {
    const user = await fetchUserById(otherUserId);
    const name = user?.fullName?.trim() || user?.username || "Chat";
    return { name, avatar: userInitials(name) };
  }

  if (conversation?.listingId) {
    const listing = await fetchListingById(conversation.listingId);
    if (listing) {
      return { name: listing.title, avatar: userInitials(listing.title) };
    }
  }

  return { name: "Conversation", avatar: "?" };
}
