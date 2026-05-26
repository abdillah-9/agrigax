export interface Payment {
  id: string;

  bookingId: string;

  amount: number;

  method:
    | "mpesa"
    | "tigopesa"
    | "airtelmoney"
    | "bank";

  status:
    | "pending"
    | "completed"
    | "failed"
    | "refunded";

  createdAt: string;
}