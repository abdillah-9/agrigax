import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiMail, HiPhone, HiAtSymbol, HiCheck } from "react-icons/hi";
import { useUsers } from "../../../hooks/useUsers";
import { useAuthContext } from "../../../contexts/AuthContext";
import { userInitials } from "../../../utils/userDisplay";
import "../styles/customer.css";

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

  const displayName = fullName || username || "User";

  return (
    <main className="customer-page customer-page-max">
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">My Profile</h1>
          <p className="customer-page-subtitle">Manage your personal information</p>
        </div>
      </div>

      {error && <p className="listings-count-text" style={{ color: "#b42318" }}>{error}</p>}

      <section className="profile-premium-card">
        <div className="profile-cover profile-cover-customer" />
        <div className="profile-avatar-section">
          <div className="profile-avatar-lg profile-avatar-customer">{userInitials(displayName)}</div>
          <div className="profile-avatar-info">
            <h2 className="profile-display-name">{displayName}</h2>
            <p className="profile-member-since">
              @{username}
              {user && !user.isVerified && " · Phone not verified"}
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
              <HiMail />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Full Name</p>
              <input
                className="profile-field-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-blue">
              <HiMail />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Email</p>
              <span className="profile-field-value">{email || "Not set"}</span>
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
              to unlock bookings, wallet, and messages.
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
          </div>
        </div>
      </section>
    </main>
  );
}
