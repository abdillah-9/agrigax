import type { CSSProperties } from "react";
import type { Category, Listing } from "../types/api.types";

export function categoryNameById(categories: Category[], categoryId: string | null) {
  if (!categoryId) return "Uncategorized";
  return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
}

export function listingImageStyle(listing: Listing): CSSProperties | undefined {
  if (!listing.images?.length) return undefined;
  return {
    backgroundImage: `url(${listing.images[0]})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function formatListingType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
