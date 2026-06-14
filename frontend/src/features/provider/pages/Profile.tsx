import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiPhone, HiCheck } from "react-icons/hi2";
import { BsMailbox } from "react-icons/bs";
import { HiAtSymbol } from "react-icons/hi";
import { useUsers } from "../../../hooks/useUsers";
import { useAuthContext } from "../../../contexts/AuthContext";
import { userInitials, roleLabel } from "../../../utils/userDisplay";
import "../styles/provider.css";

export default function Profile() {
  const { user, setUser } = useAuthContext();
  const { fetchProfile, updateProfile, loading, error } = useUsers();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile().then((profile) => {
      if (!profile) return;
      setFullName(profile.fullName);
      setPhone(profile.phone);
      setEmail(profile.email);
      setUsername(profile.username);
    });
  }, [fetchProfile]);

  async function handleSave() {
    const updated = await updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
    if (!updated) return;

    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const displayName = fullName || username || "Provider";

  return (
    <main className="customer-page" style={{ maxWidth: 700 }}>
      <div className="customer-page-header">
        <h1 className="customer-page-title">Provider Profile</h1>
        <p className="customer-page-subtitle">Manage your public business profile</p>
      </div>

      {error && <p className="listings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <section className="profile-premium-card">
        <div className="profile-cover profile-cover-provider" />

        <div className="profile-avatar-section">
          <div className="profile-avatar-lg profile-avatar-provider">{userInitials(displayName)}</div>
          <div className="profile-avatar-info">
            <h2 className="profile-display-name">{displayName}</h2>
            <p className="profile-member-since">
              {user ? roleLabel(user.role) : "Service Provider"} · @{username}
            </p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-blue">
              <HiAtSymbol />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Username</p>
              <span className="profile-field-value">{username}</span>
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-blue">
              <BsMailbox />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Display Name</p>
              <input
                className="profile-field-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-blue">
              <BsMailbox />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Email</p>
              <input className="profile-field-input" value={email || ""} disabled />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-green">
              <HiPhone />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Phone</p>
              <input
                className="profile-field-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {!user?.isVerified && (
            <p className="profile-member-since">
              <Link to="/verify-otp" state={{ phone, purpose: "registration" }}>
                Verify your phone
              </Link>{" "}
              to manage bookings and earnings.
            </p>
          )}

          <div className="profile-save-wrap">
            <button className="btn-withdraw" onClick={handleSave} disabled={loading}>
              {saved ? (
                <>
                  <HiCheck className="dash-btn-icon" /> Profile Updated!
                </>
              ) : loading ? (
                "Saving..."
              ) : (
                "Update Profile"
              )}
            </button>
            <Link to="/forgot-password" className="btn-report" style={{ marginLeft: 12 }}>
              Change Password
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
