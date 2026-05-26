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
      
      <section className="luxury-card">
        <div className="luxury-card-grid">
          <div className="luxury-visual">
            <div className="luxury-visual-content">
              <div className="luxury-icon-frame">
                <div className="luxury-icon-inner">
                  <img src="/icon.svg" className="luxury-logo" alt="Agrigax" />
                </div>
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
                <div className="luxury-alt-divider">
                  <span className="luxury-alt-text">or</span>
                </div>
                
                <div className="luxury-alt-buttons">
                  <button
                    className="luxury-alt-btn"
                    onClick={() => navigate("/app")}
                  >
                    <span className="luxury-alt-btn-icon">👤</span>
                    <span>Continue as Customer</span>
                  </button>
                  
                  <button
                    className="luxury-alt-btn"
                    onClick={() => navigate("/provider")}
                  >
                    <span className="luxury-alt-btn-icon">⭐</span>
                    <span>Become a Provider</span>
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