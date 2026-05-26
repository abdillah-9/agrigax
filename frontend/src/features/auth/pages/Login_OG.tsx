import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();

    // TEMP LOGIC (later replace with API)
    if (email.includes("provider")) {
      navigate("/provider");
    } else {
      navigate("/app");
    }
  }

  return (
    <main className="auth-page">

      <section className="auth-card shadow-lg radius-xl">

        {/* LEFT SIDE */}
        <div className="auth-left bg-primary-base">
          <img src="/icon.svg" className="auth-logo" />

          <h1 className="auth-brand-title">AGRIGAX</h1>

          <p className="auth-brand-text">
            Connect with trusted providers and manage services.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">

          <h2 className="text-2xl fw-bold">Welcome Back</h2>

          <form onSubmit={handleLogin} className="flex-col gap-lg">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="auth-btn bg-primary-base">
              Sign In
            </button>

          </form>

          {/* QUICK ACTIONS */}
          <div className="flex-col gap-md mt-xl">

            <button
              className="auth-outline-btn"
              onClick={() => navigate("/app")}
            >
              Continue as Customer
            </button>

            <button
              className="auth-outline-btn"
              onClick={() => navigate("/provider")}
            >
              Become a Provider
            </button>

          </div>

          <p className="mt-xl">
            Don&apos;t have an account?
            <Link to="/register"> Create Account</Link>
          </p>

        </div>

      </section>

    </main>
  );
}