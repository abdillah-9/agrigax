// LoginLuxury.tsx
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { FiUser, FiStar } from "react-icons/fi";
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
            
            {/* Geometric shapes - slightly visible */}
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
                <p className="luxury-form-desc">Sign in to your account</p>
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

                <button type="submit" className="luxury-btn">
                  <span className="luxury-btn-text">Sign In</span>
                  <span className="luxury-btn-icon">→</span>
                </button>
              </form>

              <div className="luxury-alt-section">
                <div className="luxury-alt-buttons">
                  <button
                    className="luxury-alt-btn"
                    onClick={() => navigate("/app")}
                  >
                    <FiUser className="luxury-alt-btn-icon" />
                    <span>Customer</span>
                  </button>
                  
                  <button
                    className="luxury-alt-btn luxury-alt-btn-gold"
                    onClick={() => navigate("/provider")}
                  >
                    <FiStar className="luxury-alt-btn-icon" />
                    <span>Provider</span>
                  </button>
                </div>
              </div>

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