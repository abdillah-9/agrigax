import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import "../styles/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword, loading, error } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = await resetPassword({ password, confirmPassword });
    if (!result?.user) return;

    navigate("/login");
  }

  return (
    <main className="auth-page">
      <section className="auth-card shadow-lg radius-xl">
        <div className="auth-left bg-primary-darker">
          <img src="/favicon.svg" alt="Logo" className="auth-logo" />
          <h1 className="auth-brand-title">Reset Password</h1>
          <p className="auth-brand-text">Choose a new password for your Agrigax account.</p>
        </div>

        <div className="auth-right">
          <h2 className="text-2xl fw-bold neutral-dark mb-sm">New Password</h2>
          <p className="text-sm neutral-dark mb-xl">Enter and confirm your new password</p>

          {error && <p className="text-sm mb-sm" style={{ color: "#b42318" }}>{error}</p>}

          <form className="flex-col gap-lg" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="auth-field">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="auth-btn bg-primary-base" disabled={loading}>
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>

          <p className="auth-bottom-text">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
