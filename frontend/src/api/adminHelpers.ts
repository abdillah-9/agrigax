import apiClient from "./client";
import { LISTINGS, USERS } from "./endpoints";
import type {
  ApiResponse,
  Category,
  Dispute,
  EnrichedAdminReview,
  EnrichedDispute,
  EnrichedPendingListing,
  Listing,
  Review,
  User,
} from "../types/api.types";

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function listingApprovalStatus(listing: Listing) {
  if (listing.isApproved) return "approved";
  if (!listing.isAvailable) return "rejected";
  return "pending";
}

export function disputeStatusLabel(status: Dispute["status"]) {
  if (status === "under_review") return "Under Review";
  if (status === "resolved") return "Resolved";
  return "Open";
}

export function disputeBadgeClass(status: Dispute["status"]) {
  if (status === "resolved") return "success";
  if (status === "under_review") return "warning";
  return "danger";
}

const userCache = new Map<string, User | null>();
const listingCache = new Map<string, Listing | null>();

async function getUser(id: string) {
  if (userCache.has(id)) return userCache.get(id) ?? null;
  try {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>(USERS.BY_ID(id));
    userCache.set(id, data.data.user);
    return data.data.user;
  } catch {
    userCache.set(id, null);
    return null;
  }
}

async function getListing(id: string) {
  if (listingCache.has(id)) return listingCache.get(id) ?? null;
  try {
    const { data } = await apiClient.get<ApiResponse<Listing>>(LISTINGS.BY_ID(id));
    listingCache.set(id, data.data);
    return data.data;
  } catch {
    listingCache.set(id, null);
    return null;
  }
}

export function clearAdminLookupCache() {
  userCache.clear();
  listingCache.clear();
}

export async function enrichPendingListings(
  listings: Listing[],
  categories: Category[]
): Promise<EnrichedPendingListing[]> {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return Promise.all(
    listings.map(async (listing) => {
      const provider = listing.providerId ? await getUser(listing.providerId) : null;
      return {
        ...listing,
        providerName: provider?.fullName || provider?.username || "Provider",
        categoryName: listing.categoryId
          ? categoryMap[listing.categoryId] || `Category #${listing.categoryId}`
          : "—",
      };
    })
  );
}

export async function enrichDisputes(disputes: Dispute[]): Promise<EnrichedDispute[]> {
  return Promise.all(
    disputes.map(async (dispute) => {
      const [customer, provider] = await Promise.all([
        dispute.customerId ? getUser(dispute.customerId) : null,
        dispute.providerId ? getUser(dispute.providerId) : null,
      ]);

      return {
        ...dispute,
        customerName: customer?.fullName || customer?.username || "Customer",
        providerName: provider?.fullName || provider?.username || "Provider",
        serviceTitle: dispute.listingTitle || "—",
        amount: dispute.amount ?? 0,
      };
    })
  );
}

export async function enrichAdminReviews(reviews: Review[]): Promise<EnrichedAdminReview[]> {
  return Promise.all(
    reviews.map(async (review) => {
      const [author, listing] = await Promise.all([
        getUser(review.userId),
        getListing(review.listingId),
      ]);
      const provider = listing?.providerId ? await getUser(listing.providerId) : null;

      return {
        ...review,
        authorName: author?.fullName || author?.username || "User",
        listingTitle: listing?.title || `Listing #${review.listingId}`,
        providerName: provider?.fullName || provider?.username || "Provider",
      };
    })
  );
}

export function toCategoryCreateBody(payload: {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}) {
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description ?? "",
    is_active: payload.isActive ?? true,
  };
}

export function toCategoryUpdateBody(payload: {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
}) {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  return body;
}
