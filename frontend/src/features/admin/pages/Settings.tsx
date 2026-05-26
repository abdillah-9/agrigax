import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: "AGRIGAX",
    supportEmail: "support@agrigax.co.tz",
    commissionRate: 10,
    maxListingsPerProvider: 50,
    autoApproveProviders: false,
    maintenanceMode: false,
    allowGuestBrowsing: true,
    defaultCurrency: "TZS",
  });

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Configure platform-wide settings</p>
      </div>

      <div className="form-section">
        <div className="form-section-title">
          <span className="form-section-title-text">General Settings</span>
          <span className="form-section-line" />
        </div>
        <div className="form-grid">
          <div>
            <label className="label label-required">Site Name</label>
            <input
              className="input-text"
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange("siteName", e.target.value)}
            />
          </div>
          <div>
            <label className="label label-required">Support Email</label>
            <input
              className="input-text"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange("supportEmail", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Default Currency</label>
            <select
              className="input-select"
              value={settings.defaultCurrency}
              onChange={(e) => handleChange("defaultCurrency", e.target.value)}
            >
              <option value="TZS">TZS - Tanzanian Shilling</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">
          <span className="form-section-title-text">Platform Configuration</span>
          <span className="form-section-line" />
        </div>
        <div className="form-grid">
          <div>
            <label className="label">Commission Rate (%)</label>
            <input
              className="input-number"
              type="number"
              value={settings.commissionRate}
              onChange={(e) => handleChange("commissionRate", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Max Listings per Provider</label>
            <input
              className="input-number"
              type="number"
              value={settings.maxListingsPerProvider}
              onChange={(e) => handleChange("maxListingsPerProvider", Number(e.target.value))}
            />
          </div>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                className="input-checkbox"
                type="checkbox"
                checked={settings.autoApproveProviders}
                onChange={(e) => handleChange("autoApproveProviders", e.target.checked)}
              />
              Auto-approve new providers
            </label>
          </div>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                className="input-checkbox"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
              />
              Maintenance Mode
            </label>
          </div>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                className="input-checkbox"
                type="checkbox"
                checked={settings.allowGuestBrowsing}
                onChange={(e) => handleChange("allowGuestBrowsing", e.target.checked)}
              />
              Allow guest browsing
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-outline">Reset</button>
        <button className="btn btn-primary">Save Settings</button>
      </div>
    </div>
  );
}
