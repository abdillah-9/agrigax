import { useState } from "react";
import { HiMail, HiChat, HiBell, HiSpeakerphone, HiShieldCheck, HiCheck } from "react-icons/hi";
import { useUsers } from "../../../hooks/useUsers";
import "../styles/customer.css";

export default function Settings() {
  const { updateSettings, loading, error } = useUsers();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
  });
  const [saved, setSaved] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleSave() {
    setInfoMessage(null);
    const result = await updateSettings(settings);

    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setInfoMessage(
      error || "Settings could not be saved. User preferences sync is limited in V1."
    );
  }

  const items = [
    { key: "emailNotifications" as const, title: "Email Notifications", desc: "Receive booking updates via email", icon: HiMail, iconClass: "settings-icon-blue" },
    { key: "smsNotifications" as const, title: "SMS Notifications", desc: "Receive booking alerts via SMS", icon: HiChat, iconClass: "settings-icon-green" },
    { key: "pushNotifications" as const, title: "Push Notifications", desc: "Get real-time push notifications", icon: HiBell, iconClass: "settings-icon-gold" },
    { key: "marketingEmails" as const, title: "Marketing Emails", desc: "Receive promotional offers and updates", icon: HiSpeakerphone, iconClass: "settings-icon-secondary" },
    { key: "twoFactorAuth" as const, title: "Two-Factor Authentication", desc: "Not available in V1", icon: HiShieldCheck, iconClass: "settings-icon-red" },
  ];

  return (
    <main className="customer-page customer-page-max">
      <div className="customer-page-header">
        <div>
          <h1 className="customer-page-title">Settings</h1>
          <p className="customer-page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <p className="profile-member-since" style={{ marginBottom: 16 }}>
        Preference toggles are shown for UI preview. Backend user settings sync is not fully available in V1.
      </p>

      {(error || infoMessage) && (
        <p className="listings-count-text" style={{ color: "#b42318" }}>{infoMessage || error}</p>
      )}

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
                disabled={item.key === "twoFactorAuth"}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </section>

      <div className="settings-save-wrap">
        <button className="btn-withdraw" onClick={handleSave} disabled={loading}>
          {saved ? <><HiCheck className="dash-btn-icon" /> Settings Saved!</> : loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </main>
  );
}
