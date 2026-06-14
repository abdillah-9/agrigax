import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import "../styles/auth.css";

function homeForRole(role: string) {
  if (role === "provider") return "/provider";
  if (role === "admin") return "/admin";
  return "/app";
}

export default function LoginLuxury() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const result = await login({ identifier, password });
    if (!result?.user) return;

    if (!result.user.isVerified) {
      navigate("/verify-otp", {
        state: { phone: result.user.phone, purpose: "registration" },
      });
      return;
    }

    navigate(homeForRole(result.user.role));
  }

  return (
    <main className="auth-page-luxury">
      <div className="luxury-bg-pattern"></div>
      <div className="luxury-bg-orb luxury-orb-1"></div>
      <div className="luxury-bg-orb luxury-orb-2"></div>

      <section className="luxury-card">
        <div className="luxury-card-grid">
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
                  Premium agricultural services at your fingertips
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
                <h2 className="luxury-form-title">Welcome back</h2>
                <p className="luxury-form-desc">Sign in with username, phone, or email</p>
              </div>

              {error && <p className="luxury-form-desc" style={{ color: "#b42318" }}>{error}</p>}

              <form onSubmit={handleLogin} className="luxury-form">
                <div className="luxury-input-wrapper">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="luxury-input"
                    id="identifier"
                    required
                  />
                  <label htmlFor="identifier" className="luxury-input-label">
                    Username, phone, or email
                  </label>
                  <div className="luxury-input-border"></div>
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="luxury-input"
                    id="password"
                    required
                  />
                  <label htmlFor="password" className="luxury-input-label">Password</label>
                  <div className="luxury-input-border"></div>
                </div>

                <button type="submit" className="luxury-btn" disabled={loading}>
                  <span className="luxury-btn-text">{loading ? "Signing in..." : "Sign In"}</span>
                  <span className="luxury-btn-icon">→</span>
                </button>
              </form>

              <p className="luxury-footer-text">
                <Link to="/forgot-password" className="luxury-footer-link">
                  Forgot password?
                </Link>
              </p>

              <p className="luxury-footer-text">
                Don't have an account?{" "}
                <Link to="/register" className="luxury-footer-link">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
