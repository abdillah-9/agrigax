import { useState } from "react";
import {
  HiPhone,
  HiTag,
  HiCalendar,
  HiCheck,
} from "react-icons/hi2";
import "../styles/provider.css";
import { BsMailbox } from "react-icons/bs";
import { HiLocationMarker } from "react-icons/hi";

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
    <main className="customer-page" style={{ maxWidth: 700 }}>
      {/* Page Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Provider Profile</h1>
        <p className="customer-page-subtitle">Manage your public business profile</p>
      </div>

      {/* Profile Card */}
      <section className="profile-premium-card">
        {/* Cover */}
        <div className="profile-cover profile-cover-provider" />

        {/* Avatar + Name */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-lg profile-avatar-provider">A</div>
          <div className="profile-avatar-info">
            <h2 className="profile-display-name">{profile.businessName}</h2>
            <p className="profile-member-since">{profile.description}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="profile-body">
          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-blue">
              <BsMailbox />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Email</p>
              <input
                className="profile-field-input"
                value={profile.email}
                disabled
              />
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
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-red">
              <HiLocationMarker />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Location</p>
              <input
                className="profile-field-input"
                value={profile.location}
                onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-gold">
              <HiTag />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Category</p>
              <span className="badge badge-info">{profile.category}</span>
            </div>
          </div>

          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-gray">
              <HiCalendar />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Member Since</p>
              <span className="profile-field-value">{profile.joinedDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-save-wrap">
            <button className="btn-withdraw" onClick={handleSave}>
              {saved ? (
                <><HiCheck className="dash-btn-icon" /> Profile Updated!</>
              ) : (
                "Update Profile"
              )}
            </button>
            <button className="btn-report" style={{ marginLeft: 12 }}>Change Password</button>
          </div>
        </div>
      </section>
    </main>
  );
}
