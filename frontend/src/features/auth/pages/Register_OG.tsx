// # `features/auth/pages/Register.tsx`

import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Register() {
  const [role, setRole] = useState<"customer" | "provider">("customer");

  return (
    <main className="auth-page">
      <section className="auth-card auth-register-card shadow-lg radius-xl">

        <div className="auth-left bg-primary-dark">
          <img
            src="/icon.svg"
            alt="Logo"
            className="auth-logo"
          />

          <h1 className="auth-brand-title">
            Join AGRIGAX
          </h1>

          <p className="auth-brand-text">
            Discover agricultural services,
            connect with providers, and manage
            everything from one platform.
          </p>
        </div>

        <div className="auth-right">

          <h2 className="text-2xl fw-bold neutral-dark mb-sm">
            Create Account
          </h2>

          <p className="text-sm neutral-dark mb-xl">
            Start using the platform today
          </p>

          <div className="auth-role-switch mb-xl">

            <button
              onClick={() => setRole("customer")}
              className={role === "customer"
                ? "auth-role-btn active-role"
                : "auth-role-btn"
              }
            >
              Customer
            </button>

            <button
              onClick={() => setRole("provider")}
              className={role === "provider"
                ? "auth-role-btn active-role"
                : "auth-role-btn"
              }
            >
              Provider
            </button>

          </div>

          <form className="flex-col gap-lg">

            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" placeholder="Enter full name" />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input type="email" placeholder="Enter email" />
            </div>

            <div className="auth-field">
              <label>Phone Number</label>
              <input type="tel" placeholder="Enter phone number" />
            </div>

            {role === "provider" && (
              <div className="auth-field">
                <label>Business Name</label>
                <input
                  type="text"
                  placeholder="Enter business name"
                />
              </div>
            )}

            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Create password" />
            </div>

            <button
              type="submit"
              className="auth-btn bg-primary-base"
            >
              Create Account
            </button>

          </form>

          <p className="auth-bottom-text">
            Already have an account?

            <Link to="/login">
              Sign In
            </Link>
          </p>

        </div>

      </section>
    </main>
  );
}