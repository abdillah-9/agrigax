import { useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "Abdillah Suleiman",
    email: "abdillah@gmail.com",
    phone: "+255 700 000 000",
    location: "Dar es Salaam",
    joinedDate: "2026-01-15",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="p-xl" style={{ maxWidth: 640 }}>
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">My Profile</h1>
        <p className="text-sm text-muted mt-xs">Manage your personal information</p>
      </div>

      <section className="profile-premium-card">
        <div className="profile-cover" style={{ background: "linear-gradient(135deg, #3A7BD5 0%, #25579E 100%)" }} />
        <div className="profile-avatar-section">
          <div className="profile-avatar-lg" style={{ background: "linear-gradient(135deg, #3A7BD5, #25579E)" }}>A</div>
          <div style={{ paddingBottom: 8 }}>
            <h2 className="text-xl fw-bold neutral-dark">{profile.fullName}</h2>
            <p className="text-sm text-muted">Customer since {profile.joinedDate}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(58,123,213,0.1)", color: "#3A7BD5" }}>📧</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Email</p>
              <span className="text-sm">{profile.email}</span>
            </div>
          </div>
          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(46,125,79,0.1)", color: "#2E7D4F" }}>📞</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Phone</p>
              <input className="input-text" style={{ border: "none", padding: "4px 0", background: "transparent", fontSize: 14 }} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(214,69,69,0.1)", color: "#D64545" }}>📍</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Location</p>
              <input className="input-text" style={{ border: "none", padding: "4px 0", background: "transparent", fontSize: 14 }} value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} />
            </div>
          </div>
          <div className="profile-field-premium">
            <div className="profile-field-icon" style={{ background: "rgba(150,150,150,0.1)", color: "#888" }}>📅</div>
            <div className="profile-field-content">
              <p className="profile-field-label">Member Since</p>
              <span className="text-sm">{profile.joinedDate}</span>
            </div>
          </div>
          <div className="mt-xl">
            <button className="btn-withdraw" onClick={handleSave}>
              {saved ? "✓ Profile Updated!" : "Update Profile"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
