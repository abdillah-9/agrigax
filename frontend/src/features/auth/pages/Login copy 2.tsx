// LoginNeon.tsx
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.css";

export default function LoginNeon() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.includes("provider")) {
      navigate("/provider");
    } else {
      navigate("/app");
    }
  }

  return (
    <main className="auth-page-neon">
      <div className="neon-grid"></div>
      <div className="neon-particles">
        <div className="neon-particle"></div>
        <div className="neon-particle"></div>
        <div className="neon-particle"></div>
        <div className="neon-particle"></div>
      </div>

      <section className="neon-card">
        <div className="neon-card-container">
          <div className="neon-left">
            <div className="neon-logo-glow">
              <img src="/icon.svg" className="neon-logo" alt="Agrigax Logo" />
            </div>
            <h1 className="neon-brand-title">
              <span className="neon-text-glow">AGRIGAX</span>
            </h1>
            <p className="neon-brand-desc">
              Empowering agriculture through trusted connections
            </p>
            <div className="neon-features">
              <div className="neon-feature-item">
                <div className="neon-feature-icon">🌾</div>
                <span>Verified Providers</span>
              </div>
              <div className="neon-feature-item">
                <div className="neon-feature-icon">⚡</div>
                <span>Instant Booking</span>
              </div>
              <div className="neon-feature-item">
                <div className="neon-feature-icon">🛡️</div>
                <span>Secure Payments</span>
              </div>
            </div>
          </div>

          <div className="neon-right">
            <div className="neon-form-header">
              <h2 className="neon-form-title">Sign In</h2>
              <p className="neon-form-subtitle">Access your agricultural dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="neon-form">
              <div className="neon-field">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="neon-input"
                  required
                />
                <label className="neon-label">Email Address</label>
              </div>

              <div className="neon-field">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neon-input"
                  required
                />
                <label className="neon-label">Password</label>
              </div>

              <button type="submit" className="neon-btn">
                <span>Sign In</span>
                <div className="neon-btn-glow"></div>
              </button>
            </form>

            <div className="neon-quick-links">
              <button
                className="neon-link-btn"
                onClick={() => navigate("/app")}
              >
                Continue as Customer
              </button>
              <button
                className="neon-link-btn"
                onClick={() => navigate("/provider")}
              >
                Become a Provider
              </button>
            </div>

            <p className="neon-register">
              New to Agrigax?{" "}
              <Link to="/register" className="neon-register-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}