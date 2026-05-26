// `features/auth/pages/VerifyOtp.tsx`

import "../styles/auth.css";

export default function VerifyOtp() {
  return (
    <main className="auth-page">
      <section className="auth-card shadow-lg radius-xl">

        <div className="auth-left bg-primary-darkest">
          <img
            src="/icon.svg"
            alt="Logo"
            className="auth-logo"
          />

          <h1 className="auth-brand-title">
            OTP Verification
          </h1>

          <p className="auth-brand-text">
            Verify your account securely
            using the one-time code sent
            to your phone.
          </p>
        </div>

        <div className="auth-right">

          <h2 className="text-2xl fw-bold neutral-dark mb-sm">
            Verify OTP
          </h2>

          <p className="text-sm neutral-dark mb-xl">
            Enter the verification code
          </p>

          <form className="flex-col gap-lg">

            <div className="auth-field">
              <label>OTP Code</label>

              <input
                type="text"
                placeholder="Enter OTP"
                className="otp-input"
              />
            </div>

            <button
              type="submit"
              className="auth-btn bg-primary-base"
            >
              Verify
            </button>

          </form>

        </div>

      </section>
    </main>
  );
}