import { useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "Admin User",
    email: "admin@agrigax.co.tz",
    phone: "+255 700 000 000",
    role: "Super Admin",
    lastLogin: "2026-05-20 08:30 AM",
    accountCreated: "2026-01-01",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

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
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 12
          }}>
            AU
          </div>
          <button className="btn btn-outline btn-sm">Change Avatar</button>
        </div>
        <div className="form-grid">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input-text"
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input-text"
              type="email"
              value={profile.email}
              disabled
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input-text"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input-text" type="text" value={profile.role} disabled />
          </div>
        </div>
        <div className="inv-auto-badge" style={{ marginTop: 16 }}>
          <span className="inv-auto-badge-dot" />
          Last login: {profile.lastLogin}
        </div>
        <div className="form-actions">
          <button className="btn btn-primary">Update Profile</button>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">
          <span className="form-section-title-text">Change Password</span>
          <span className="form-section-line" />
        </div>
        <div className="form-grid">
          <div>
            <label className="label label-required">Current Password</label>
            <input
              className="input-text"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="label label-required">New Password</label>
            <input
              className="input-text"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="label label-required">Confirm New Password</label>
            <input
              className="input-text"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary">Change Password</button>
        </div>
      </div>
    </div>
  );
}
