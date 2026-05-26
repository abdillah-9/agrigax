import { useState } from "react";
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
      icon: "🔔",
      bg: "rgba(58,123,213,0.1)"
    },
    {
      key: "emailUpdates" as const,
      title: "Email Updates",
      desc: "Receive weekly performance reports and tips",
      icon: "📧",
      bg: "rgba(46,125,79,0.1)"
    },
    {
      key: "autoAccept" as const,
      title: "Auto-Accept Bookings",
      desc: "Automatically confirm incoming booking requests",
      icon: "⚡",
      bg: "rgba(214,198,133,0.15)"
    },
    {
      key: "showPhoneNumber" as const,
      title: "Show Phone Number",
      desc: "Display your phone number publicly on listings",
      icon: "📞",
      bg: "rgba(175,154,90,0.1)"
    },
    {
      key: "vacationMode" as const,
      title: "Vacation Mode",
      desc: "Temporarily hide all your listings from search",
      icon: "🏖️",
      bg: "rgba(214,69,69,0.08)"
    },
  ];

  return (
    <main className="p-xl" style={{ maxWidth: 640 }}>
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Settings</h1>
        <p className="text-sm text-muted mt-xs">Manage your provider account preferences</p>
      </div>

      {/* Settings Items */}
      <section style={{
        background: "white",
        borderRadius: 20,
        border: "1px solid rgba(75,129,91,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 4
      }}>
        {items.map(item => (
          <div key={item.key} className="settings-item-premium">
            <div className="settings-item-icon" style={{ background: item.bg }}>
              {item.icon}
            </div>
            <div className="settings-item-content">
              <h3 className="text-sm fw-semibold">{item.title}</h3>
              <p className="text-xs text-muted mt-xs">{item.desc}</p>
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
      <div className="mt-xl">
        <button className="btn-withdraw" onClick={handleSave}>
          {saved ? "✓ Settings Saved!" : "Save Settings"}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="danger-zone mt-xl">
        <h3 className="fw-semibold" style={{ color: "#D64545" }}>Danger Zone</h3>
        <p className="text-sm text-muted mt-xs">Irreversible actions for your account</p>
        <div className="flex gap-sm mt-lg">
          <button className="btn btn-outline btn-sm" style={{ color: "#D64545", borderColor: "#FBE3E3" }}>
            Deactivate Account
          </button>
          <button className="btn btn-outline btn-sm" style={{ color: "#D64545", borderColor: "#FBE3E3" }}>
            Delete Account
          </button>
        </div>
      </div>
    </main>
  );
}
