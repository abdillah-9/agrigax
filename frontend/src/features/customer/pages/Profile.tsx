import { useState } from "react";
import { HiMail, HiPhone, HiLocationMarker, HiCalendar, HiCheck } from "react-icons/hi";
import "../styles/customer.css";

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
    <main className="customer-page customer-page-max">
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">My Profile</h1>
          <p className="customer-page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <section className="profile-premium-card">
        <div className="profile-cover profile-cover-customer" />
        <div className="profile-avatar-section">
          <div className="profile-avatar-lg profile-avatar-customer">A</div>
          <div className="profile-avatar-info">
            <h2 className="profile-display-name">{profile.fullName}</h2>
            <p className="profile-member-since">Customer since {profile.joinedDate}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-field-premium">
            <div className="profile-field-icon profile-field-icon-blue">
              <HiMail />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Email</p>
              <span className="profile-field-value">{profile.email}</span>
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
            <div className="profile-field-icon profile-field-icon-gray">
              <HiCalendar />
            </div>
            <div className="profile-field-content">
              <p className="profile-field-label">Member Since</p>
              <span className="profile-field-value">{profile.joinedDate}</span>
            </div>
          </div>

          <div className="profile-save-wrap">
            <button className="btn-withdraw" onClick={handleSave}>
              {saved ? <><HiCheck className="dash-btn-icon" /> Profile Updated!</> : "Update Profile"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
