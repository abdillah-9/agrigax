import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiShield, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import { isDevOtpVisible, logDevOtp } from "../../../utils/authDev";
import "../styles/auth.css";

type OtpPurpose = "registration" | "password_reset";

interface LocationState {
  phone?: string;
  purpose?: OtpPurpose;
  devOtp?: string;
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const { verifyOtp, resendOtp, loading, error } = useAuth();

  const [phone, setPhone] = useState(state.phone || "");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(state.devOtp || "");
  const purpose: OtpPurpose = state.purpose || "registration";

  useEffect(() => {
    logDevOtp(state.devOtp, purpose);
  }, [state.devOtp, purpose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = await verifyOtp({ phone: phone.trim(), otp: otp.trim(), purpose });
    if (!result) return;

    if (purpose === "password_reset") {
      navigate("/reset-password");
      return;
    }

    const role = result.data?.user?.role || "customer";
    if (role === "provider") navigate("/provider");
    else if (role === "admin") navigate("/admin");
    else navigate("/app");
  }

  async function handleResend() {
    if (!phone.trim()) return;
    const nextOtp = await resendOtp(phone.trim(), purpose);
    if (nextOtp) setDevOtp(nextOtp);
  }

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
                <p className="luxury-brand-tagline">Secure verification for your account</p>
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
                <p className="luxury-form-desc">Enter the code sent to your phone</p>
              </div>

              {error && <p className="luxury-form-desc" style={{ color: "#b42318" }}>{error}</p>}

              {isDevOtpVisible() && devOtp && (
                <p
                  className="luxury-otp-hint"
                  style={{
                    color: "#047857",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "10px 12px",
                  }}
                >
                  Dev OTP: <strong>{devOtp}</strong> — also logged in browser console and backend terminal.
                </p>
              )}

              <form className="luxury-form" onSubmit={handleSubmit}>
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
                </div>

                <div className="luxury-input-wrapper">
                  <input
                    type="text"
                    className="luxury-input luxury-otp-input"
                    id="otp"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <label htmlFor="otp" className="luxury-input-label">OTP Code</label>
                  <div className="luxury-input-border"></div>
                  <div className="luxury-input-icon-right"><FiShield /></div>
                </div>

                <p className="luxury-otp-hint">
                  Didn't receive the code?{" "}
                  <button type="button" className="luxury-resend-link" onClick={handleResend}>
                    Resend OTP
                  </button>
                </p>

                <button type="submit" className="luxury-btn" disabled={loading}>
                  <span className="luxury-btn-text">{loading ? "Verifying..." : "Verify Account"}</span>
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
