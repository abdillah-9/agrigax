import { useState } from "react";
import "../styles/provider.css";

export default function Profile() {
  const [profile, setProfile] = useState({
    businessName: "Agro Solutions Ltd",
    description: "Irrigation & Equipment Provider",
    email: "provider@gmail.com",
    phone: "+255 700 000 000",
    location: "Dar es Salaam",
    category: "Farm Equipment",
    joinedDate: "2026-01-10",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="p-xl" style={{ maxWidth: 700 }}>
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Provider Profile</h1>
        <p className="text-sm text-muted mt-xs">Manage your public business profile</p>
      </div>

      <section className="profile-premium-card">
        {/* Cover */}
        <div className="profile-cover" />

        {/* Avatar + Name */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-lg">A</div>
          <div style={{ paddingBottom: 8 }}>
            <h2 className="text-xl fw-bold neutral-dark">{profile.businessName}</h2>
            <p className="text-sm text-muted">{profile.description}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="profile-body">
          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(58,123,213,0.1)", color: "#3A7BD5" }}>📧</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Email</p>
              <input
                className="input-text"
                style={{ border: "none", padding: "4px 0", background: "transparent", fontSize: 14 }}
                value={profile.email}
                disabled
              />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(46,125,79,0.1)", color: "#2E7D4F" }}>📞</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Phone</p>
              <input
                className="input-text"
                style={{ border: "none", padding: "4px 0", background: "transparent", fontSize: 14 }}
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(214,69,69,0.1)", color: "#D64545" }}>📍</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Location</p>
              <input
                className="input-text"
                style={{ border: "none", padding: "4px 0", background: "transparent", fontSize: 14 }}
                value={profile.location}
                onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(175,154,90,0.1)", color: "#AF9A5A" }}>🏷️</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Category</p>
              <span className="badge badge-info" style={{ marginTop: 4 }}>{profile.category}</span>
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(150,150,150,0.1)", color: "#888" }}>📅</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Member Since</p>
              <span className="text-sm">{profile.joinedDate}</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-md mt-xl">
            <button className="btn-withdraw" onClick={handleSave}>
              {saved ? "✓ Profile Updated!" : "Update Profile"}
            </button>
            <button className="btn-report">Change Password</button>
          </div>
        </div>
      </section>
    </main>
  );
}
