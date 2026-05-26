export interface Booking {
  id: string;

  listingId: string;

  listingType: string;

  customerId: string;

  providerId: string;

  status:
    | "pending"
    | "accepted"
    | "completed"
    | "cancelled";

  metadata?: Record<string, any>;

  createdAt: string;
}