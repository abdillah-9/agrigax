import { useState } from "react";
import {
  HiBell,
  HiEnvelope,
  HiBolt,
  HiPhone,
  HiSun,
  HiCheck,
} from "react-icons/hi2";
import "../styles/provider.css";

export default function Settings() {
  const [settings, setSettings] = useState({
    bookingNotifications: true,
    emailUpdates: false,
    autoAccept: false,
    showPhoneNumber: true,
    vacationMode: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const items = [
    {
      key: "bookingNotifications" as const,
      title: "Booking Notifications",
      desc: "Get instant alerts when customers book your services",
      icon: HiBell,
      iconClass: "settings-icon-blue",
    },
    {
      key: "emailUpdates" as const,
      title: "Email Updates",
      desc: "Receive weekly performance reports and tips",
      icon: HiEnvelope,
      iconClass: "settings-icon-green",
    },
    {
      key: "autoAccept" as const,
      title: "Auto-Accept Bookings",
      desc: "Automatically confirm incoming booking requests",
      icon: HiBolt,
      iconClass: "settings-icon-gold",
    },
    {
      key: "showPhoneNumber" as const,
      title: "Show Phone Number",
      desc: "Display your phone number publicly on listings",
      icon: HiPhone,
      iconClass: "settings-icon-secondary",
    },
    {
      key: "vacationMode" as const,
      title: "Vacation Mode",
      desc: "Temporarily hide all your listings from search",
      icon: HiSun,
      iconClass: "settings-icon-red",
    },
  ];

  return (
    <main className="customer-page" style={{ maxWidth: 640 }}>
      <div className="customer-page-header">
        <h1 className="customer-page-title">Settings</h1>
        <p className="customer-page-subtitle">Manage your provider account preferences</p>
      </div>

      {/* Settings Items */}
      <section className="settings-card">
        {items.map(item => (
          <div key={item.key} className="settings-item-premium">
            <div className={`settings-item-icon ${item.iconClass}`}>
              <item.icon />
            </div>
            <div className="settings-item-content">
              <h3 className="settings-item-title">{item.title}</h3>
              <p className="settings-item-desc">{item.desc}</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={() => toggle(item.key)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </section>

      {/* Save */}
      <div className="settings-save-wrap">
        <button className="btn-withdraw" onClick={handleSave}>
          {saved ? (
            <><HiCheck className="dash-btn-icon" /> Settings Saved!</>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="danger-zone">
        <h3 className="danger-zone-title">Danger Zone</h3>
        <p className="danger-zone-desc">Irreversible actions for your account</p>
        <div className="danger-zone-actions">
          <button className="dash-action-btn danger-btn-outline">Deactivate Account</button>
          <button className="dash-action-btn danger-btn-outline">Delete Account</button>
        </div>
      </div>
    </main>
  );
}
