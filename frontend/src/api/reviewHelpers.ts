import apiClient from "./client";
import { USERS } from "./endpoints";
import type { ApiResponse, EnrichedReview, Review, User } from "../types/api.types";

const userCache = new Map<string, User | null>();

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

export async function enrichReviews(reviews: Review[]): Promise<EnrichedReview[]> {
  return Promise.all(
    reviews.map(async (review) => {
      const author = await getUser(review.userId);
      return {
        ...review,
        authorName: author?.fullName || author?.username || "User",
      };
    })
  );
}

export function clearReviewLookupCache() {
  userCache.clear();
}

export function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
