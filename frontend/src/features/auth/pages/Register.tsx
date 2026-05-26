// features/auth/pages/Register.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiStar, FiMail, FiPhone, FiLock, FiUserPlus } from "react-icons/fi";
import "../styles/auth.css";

export default function Register() {
  const [role, setRole] = useState<"customer" | "provider">("customer");

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

              {/* Role Switch */}
              <div className="luxury-role-switch">
                <button
                  onClick={() => setRole("customer")}
                  className={`luxury-role-btn ${role === "customer" ? "luxury-role-active" : ""}`}
                >
                  <FiUser className="luxury-role-icon" />
                  <span>Customer</span>
                </button>
                
                <button
                  onClick={() => setRole("provider")}
                  className={`luxury-role-btn ${role === "provider" ? "luxury-role-active" : ""}`}
                >
                  <FiStar className="luxury-role-icon" />
                  <span>Provider</span>
                </button>
              </div>

              <form className="luxury-form">
                <div className="luxury-input-wrapper">
                  <input
                    type="text"
                    className="luxury-input"
                    id="fullName"
                    required
                  />
                  <label htmlFor="fullName" className="luxury-input-label">Full Name</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right">
                    <FiUserPlus />
                  </div>
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="email"
                    className="luxury-input"
                    id="email"
                    required
                  />
                  <label htmlFor="email" className="luxury-input-label">Email address</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right">
                    <FiMail />
                  </div>
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="tel"
                    className="luxury-input"
                    id="phone"
                    required
                  />
                  <label htmlFor="phone" className="luxury-input-label">Phone Number</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right">
                    <FiPhone />
                  </div>
                </div>

                {role === "provider" && (
                  <div className="luxury-input-wrapper luxury-input-reveal">
                    <input
                      type="text"
                      className="luxury-input"
                      id="businessName"
                      required
                    />
                    <label htmlFor="businessName" className="luxury-input-label">Business Name</label>
                    <div className="luxury-input-border"></div>
                    <div className="luxury-input-icon-right">
                      <FiStar />
                    </div>
                  </div>
                )}

                <div className="luxury-input-wrapper">
                  <input
                    type="password"
                    className="luxury-input"
                    id="password"
                    required
                  />
                  <label htmlFor="password" className="luxury-input-label">Password</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right">
                    <FiLock />
                  </div>
                </div>

                <button type="submit" className="luxury-btn">
                  <span className="luxury-btn-text">Create Account</span>
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