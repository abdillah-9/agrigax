import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUsers } from "../../../hooks/useUsers";
import { useAuthContext } from "../../../contexts/AuthContext";
import { roleLabel, userInitials } from "../../../utils/userDisplay";

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

  const displayName = fullName || username || "Admin";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {error && <p style={{ color: "#b42318", marginBottom: 12 }}>{error}</p>}

      <div className="form-section">
        <div className="form-section-title">
          <span className="form-section-title-text">Profile Information</span>
          <span className="form-section-line" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#4B815B",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 12
          }}>
            {userInitials(displayName)}
          </div>
        </div>
        <div className="form-grid">
          <div>
            <label className="label">Username</label>
            <input className="input-text" type="text" value={username} disabled />
          </div>
          <div>
            <label className="label">Full Name</label>
            <input
              className="input-text"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-text" type="email" value={email || ""} disabled />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input-text"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Role</label>
            <input
              className="input-text"
              type="text"
              value={user ? roleLabel(user.role) : "Administrator"}
              disabled
            />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {saved ? "Profile Updated!" : loading ? "Saving..." : "Update Profile"}
          </button>
          <Link to="/forgot-password" className="btn btn-outline" style={{ marginLeft: 12 }}>
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}
