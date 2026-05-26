// # `features/auth/pages/ForgotPassword.tsx`

import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function ForgotPassword() {
  return (
    <main className="auth-page">
      <section className="auth-card shadow-lg radius-xl">

        <div className="auth-left bg-primary-darker">
          <img
            src="/favicon.svg"
            alt="Logo"
            className="auth-logo"
          />

          <h1 className="auth-brand-title">
            Password Recovery
          </h1>

          <p className="auth-brand-text">
            Securely recover your account
            and continue managing your
            services and bookings.
          </p>
        </div>

        <div className="auth-right">

          <h2 className="text-2xl fw-bold neutral-dark mb-sm">
            Forgot Password
          </h2>

          <p className="text-sm neutral-dark mb-xl">
            Enter your email to receive a reset link
          </p>

          <form className="flex-col gap-lg">

            <div className="auth-field">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="auth-btn bg-primary-base"
            >
              Send Reset Link
            </button>

          </form>

          <p className="auth-bottom-text">
            Remember your password?

            <Link to="/login">
              Back to Login
            </Link>
          </p>

        </div>

      </section>
    </main>
  );
}