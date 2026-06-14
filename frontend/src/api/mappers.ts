import type { CreateBookingPayload, CreateListingPayload, UpdateListingPayload } from "../types/api.types";

export const toListingCreateBody = (payload: CreateListingPayload) => ({
  title: payload.title,
  description: payload.description,
  type: payload.type,
  category_id: payload.categoryId,
  location: payload.location,
  price: payload.price,
  is_available: payload.isAvailable,
  images: payload.images || [],
});

export const toListingUpdateBody = (payload: UpdateListingPayload) => {
  const body: Record<string, unknown> = {};

  if (payload.title !== undefined) body.title = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.type !== undefined) body.type = payload.type;
  if (payload.categoryId !== undefined) body.category_id = payload.categoryId;
  if (payload.location !== undefined) body.location = payload.location;
  if (payload.price !== undefined) body.price = payload.price;
  if (payload.isAvailable !== undefined) body.is_available = payload.isAvailable;
  if (payload.images !== undefined) body.images = payload.images;

  return body;
};

export const toBookingCreateBody = (payload: CreateBookingPayload) => ({
  listingId: payload.listingId,
  date: payload.date.includes("T") ? payload.date : `${payload.date}T09:00:00.000Z`,
  notes: payload.notes,
});

export const toReviewCreateBody = (payload: { listingId: string; rating: number; comment?: string }) => ({
  listingId: payload.listingId,
  rating: payload.rating,
  comment: payload.comment,
});

export const toProfileUpdateBody = (payload: { fullName?: string; phone?: string; avatar?: string }) => ({
  fullName: payload.fullName,
  phone: payload.phone,
  avatar: payload.avatar,
});
