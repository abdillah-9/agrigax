// features/auth/pages/VerifyOtp.tsx
import { Link } from "react-router-dom";
import { FiShield, FiArrowLeft } from "react-icons/fi";
import "../styles/auth.css";

export default function VerifyOtp() {
  return (
    <main className="auth-page-luxury">
      <div className="luxury-bg-pattern"></div>
      <div className="luxury-bg-orb luxury-orb-1"></div>
      <div className="luxury-bg-orb luxury-orb-2"></div>
      
      <section className="luxury-card">
        <div className="luxury-card-grid luxury-card-grid-otp">
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
                  Secure verification for your account
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
                <h2 className="luxury-form-title">Verify OTP</h2>
                <p className="luxury-form-desc">Enter the verification code sent to your phone</p>
              </div>

              <form className="luxury-form">
                <div className="luxury-input-wrapper">
                  <input
                    type="text"
                    className="luxury-input luxury-otp-input"
                    id="otp"
                    maxLength={6}
                    placeholder="000000"
                    required
                  />
                  <label htmlFor="otp" className="luxury-input-label">OTP Code</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right">
                    <FiShield />
                  </div>
                </div>

                <p className="luxury-otp-hint">
                  Didn't receive the code?{" "}
                  <button type="button" className="luxury-resend-link">
                    Resend OTP
                  </button>
                </p>

                <button type="submit" className="luxury-btn">
                  <span className="luxury-btn-text">Verify Account</span>
                  <span className="luxury-btn-icon">→</span>
                </button>
              </form>

              <p className="luxury-footer-text">
                <Link to="/login" className="luxury-footer-link luxury-back-link">
                  <FiArrowLeft className="luxury-back-icon" />
                  Back to Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}