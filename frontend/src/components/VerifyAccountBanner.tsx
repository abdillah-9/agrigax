import { Link } from "react-router-dom";
import { HiShieldExclamation } from "react-icons/hi";
import type { User } from "../types/api.types";

export default function VerifyAccountBanner({ user }: { user: User }) {
  if (user.isVerified) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 16px",
        marginBottom: "16px",
        borderRadius: "10px",
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        color: "#9a3412",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <HiShieldExclamation style={{ fontSize: "20px", flexShrink: 0 }} />
        <div>
          <strong style={{ display: "block", marginBottom: "2px" }}>Verify your phone</strong>
          <span style={{ fontSize: "14px" }}>
            Bookings, messages, and wallet require a verified account.
          </span>
        </div>
      </div>
      <Link
        to="/verify-otp"
        state={{ phone: user.phone, purpose: "registration" }}
        style={{
          whiteSpace: "nowrap",
          padding: "8px 14px",
          borderRadius: "8px",
          background: "#c2410c",
          color: "#fff",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        Verify now
      </Link>
    </div>
  );
}
