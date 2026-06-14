import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import "../styles/auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    const result = await forgotPassword({ identifier: identifier.trim() });
    if (!result) return;

    setMessage(result.message);
    navigate("/verify-otp", {
      state: {
        phone: identifier.trim(),
        purpose: "password_reset" as const,
        devOtp: result.devOtp,
      },
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card shadow-lg radius-xl">
        <div className="auth-left bg-primary-darker">
          <img src="/favicon.svg" alt="Logo" className="auth-logo" />
          <h1 className="auth-brand-title">Password Recovery</h1>
          <p className="auth-brand-text">
            Securely recover your account and continue managing your services and bookings.
          </p>
        </div>

        <div className="auth-right">
          <h2 className="text-2xl fw-bold neutral-dark mb-sm">Forgot Password</h2>
          <p className="text-sm neutral-dark mb-xl">
            Enter your username, phone, or email to receive an OTP
          </p>

          {error && <p className="text-sm mb-sm" style={{ color: "#b42318" }}>{error}</p>}
          {message && <p className="text-sm mb-sm">{message}</p>}

          <form className="flex-col gap-lg" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Username, phone, or email</label>
              <input
                type="text"
                placeholder="abdillah or +2557..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn bg-primary-base" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <p className="auth-bottom-text">
            Remember your password? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
