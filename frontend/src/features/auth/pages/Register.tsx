import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiStar, FiMail, FiPhone, FiLock, FiUserPlus, FiAtSign } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await register({
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      password,
      role,
    });

    if (!result?.user) return;

    navigate("/verify-otp", {
      state: {
        phone: result.user.phone,
        purpose: "registration" as const,
        devOtp: result.devOtp,
      },
    });
  }

  return (
    <main className="auth-page-luxury">
      <div className="luxury-bg-pattern"></div>
      <div className="luxury-bg-orb luxury-orb-1"></div>
      <div className="luxury-bg-orb luxury-orb-2"></div>

      <section className="luxury-card">
        <div className="luxury-card-grid luxury-card-grid-register">
          <div className="luxury-visual">
            <div className="luxury-visual-content">
              <div className="luxury-icon-frame">
                <div className="luxury-icon-inner">
                  <img src="/icon.svg" className="luxury-logo" alt="Agrigax" />
                </div>
                <div className="luxury-icon-ring"></div>
              </div>

              <div className="luxury-brand-block">
                <h1 className="luxury-brand-name">AGRIGAX</h1>
                <div className="luxury-brand-line"></div>
                <p className="luxury-brand-tagline">
                  Join the platform and connect with agricultural services
                </p>
              </div>
            </div>

            <div className="luxury-shapes">
              <div className="luxury-shape luxury-shape-1"></div>
              <div className="luxury-shape luxury-shape-2"></div>
              <div className="luxury-shape luxury-shape-3"></div>
            </div>
          </div>

          <div className="luxury-form-side">
            <div className="luxury-form-wrapper">
              <div className="luxury-form-head">
                <h2 className="luxury-form-title">Create Account</h2>
                <p className="luxury-form-desc">Start using the platform today</p>
              </div>

              <div className="luxury-role-switch">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`luxury-role-btn ${role === "customer" ? "luxury-role-active" : ""}`}
                >
                  <FiUser className="luxury-role-icon" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  className={`luxury-role-btn ${role === "provider" ? "luxury-role-active" : ""}`}
                >
                  <FiStar className="luxury-role-icon" />
                  <span>Provider</span>
                </button>
              </div>

              {error && <p className="luxury-form-desc" style={{ color: "#b42318" }}>{error}</p>}

              <form className="luxury-form" onSubmit={handleSubmit}>
                <div className="luxury-input-wrapper">
                  <input
                    type="text"
                    className="luxury-input"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <label htmlFor="username" className="luxury-input-label">Username</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right"><FiAtSign /></div>
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="text"
                    className="luxury-input"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <label htmlFor="fullName" className="luxury-input-label">Full Name</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right"><FiUserPlus /></div>
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="email"
                    className="luxury-input"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email" className="luxury-input-label">Email (optional)</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right"><FiMail /></div>
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="tel"
                    className="luxury-input"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <label htmlFor="phone" className="luxury-input-label">Phone Number</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right"><FiPhone /></div>
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="password"
                    className="luxury-input"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <label htmlFor="password" className="luxury-input-label">Password</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right"><FiLock /></div>
                </div>

                <button type="submit" className="luxury-btn" disabled={loading}>
                  <span className="luxury-btn-text">{loading ? "Creating..." : "Create Account"}</span>
                  <span className="luxury-btn-icon">→</span>
                </button>
              </form>

              <p className="luxury-footer-text">
                Already have an account?{" "}
                <Link to="/login" className="luxury-footer-link">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
