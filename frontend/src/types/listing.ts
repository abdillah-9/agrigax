export type ListingType =
  | "service"
  | "product"
  | "worker"
  | "equipment"
  | "livestock";

export interface Listing {
  id: string;
  title: string;
  description: string;

  type: ListingType;

  category: string;

  price: number;

  providerId: string;

  isAvailable: boolean;

  images?: string[];
}