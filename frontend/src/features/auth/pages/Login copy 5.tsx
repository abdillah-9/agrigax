// LoginLuxury.tsx
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.css";

export default function LoginLuxury() {
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
              <div className="luxury-shape luxury-circle"></div>
              <div className="luxury-shape luxury-diamond"></div>
              <div className="luxury-shape luxury-square"></div>
            </div>
          </div>

          <div className="luxury-form-side">
            <div className="luxury-form-wrapper">
              <div className="luxury-form-head">
                <h2 className="luxury-form-title">Welcome back</h2>
                <p className="luxury-form-desc">Please enter your credentials to sign in</p>
              </div>

              <form onSubmit={handleLogin} className="luxury-form">
                <div className="luxury-input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="luxury-input"
                    id="email"
                    required
                  />
                  <label htmlFor="email" className="luxury-input-label">Email address</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
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
                  <div className="luxury-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                </div>

                <div className="luxury-form-options">
                  <label className="luxury-checkbox-wrapper">
                    <input type="checkbox" className="luxury-checkbox" />
                    <span className="luxury-checkbox-text">Remember me</span>
                  </label>
                  <a href="#" className="luxury-forgot-link">Forgot password?</a>
                </div>

                <button type="submit" className="luxury-btn">
                  <span className="luxury-btn-text">Sign In</span>
                  <span className="luxury-btn-icon">→</span>
                </button>
              </form>

              <div className="luxury-alt-section">
                <div className="luxury-alt-divider">
                  <span className="luxury-alt-text">quick access</span>
                </div>
                
                <div className="luxury-alt-buttons">
                  <button
                    className="luxury-alt-btn"
                    onClick={() => navigate("/app")}
                  >
                    <span className="luxury-alt-btn-icon">👤</span>
                    <span>Customer</span>
                  </button>
                  
                  <button
                    className="luxury-alt-btn luxury-alt-btn-gold"
                    onClick={() => navigate("/provider")}
                  >
                    <span className="luxury-alt-btn-icon">⭐</span>
                    <span>Provider</span>
                  </button>
                </div>
              </div>

              <p className="luxury-footer-text">
                Don't have an account?{" "}
                <Link to="/register" className="luxury-footer-link">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}