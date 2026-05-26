// LoginGlass.tsx
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.css";

export default function LoginGlass() {
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
    <main className="auth-page-glass">
      <div className="glass-background">
        <div className="glass-shape glass-shape-1"></div>
        <div className="glass-shape glass-shape-2"></div>
        <div className="glass-shape glass-shape-3"></div>
      </div>

      <section className="glass-card">
        <div className="glass-card-inner">
          <div className="glass-left">
            <div className="glass-logo-wrapper">
              <img src="/icon.svg" className="glass-logo" alt="Agrigax Logo" />
            </div>
            <h1 className="glass-brand-title">AGRIGAX</h1>
            <p className="glass-brand-text">
              Connecting farmers with trusted agricultural service providers
            </p>
            <div className="glass-stats">
              <div className="glass-stat-item">
                <span className="glass-stat-number">10K+</span>
                <span className="glass-stat-label">Providers</span>
              </div>
              <div className="glass-stat-item">
                <span className="glass-stat-number">50K+</span>
                <span className="glass-stat-label">Customers</span>
              </div>
            </div>
          </div>

          <div className="glass-right">
            <div className="glass-form-header">
              <h2 className="glass-welcome-text">Welcome Back</h2>
              <p className="glass-subtitle">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="glass-form">
              <div className="glass-input-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  required
                />
                <span className="glass-input-icon">📧</span>
              </div>

              <div className="glass-input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  required
                />
                <span className="glass-input-icon">🔒</span>
              </div>

              <div className="glass-forgot-row">
                <label className="glass-checkbox-label">
                  <input type="checkbox" className="glass-checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="glass-forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="glass-btn-primary">
                <span>Sign In</span>
                <svg className="glass-btn-arrow" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
            </form>

            <div className="glass-divider">
              <span className="glass-divider-text">or continue with</span>
            </div>

            <div className="glass-quick-actions">
              <button
                className="glass-outline-btn"
                onClick={() => navigate("/app")}
              >
                Continue as Customer
              </button>
              <button
                className="glass-outline-btn"
                onClick={() => navigate("/provider")}
              >
                Become a Provider
              </button>
            </div>

            <p className="glass-register-text">
              Don't have an account?{" "}
              <Link to="/register" className="glass-register-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}