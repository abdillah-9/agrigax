import { useState } from "react";
import "../styles/provider.css";

const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const timeOptions = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function Availability() {
  const [schedule, setSchedule] = useState<Record<string, { status: string; start: string; end: string }>>({
    monday: { status: "available", start: "08:00", end: "17:00" },
    tuesday: { status: "available", start: "08:00", end: "17:00" },
    wednesday: { status: "available", start: "08:00", end: "17:00" },
    thursday: { status: "available", start: "08:00", end: "17:00" },
    friday: { status: "available", start: "08:00", end: "14:00" },
    saturday: { status: "unavailable", start: "08:00", end: "17:00" },
    sunday: { status: "unavailable", start: "08:00", end: "17:00" },
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log("Schedule saved:", schedule);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const availableDays = Object.values(schedule).filter(d => d.status === "available").length;

  return (
    <main className="p-xl">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="text-2xl fw-bold neutral-dark">Availability</h1>
        <p className="text-sm text-muted mt-xs">Configure your working schedule · {availableDays} days available</p>
      </div>

      {/* Quick Status */}
      <div className="provider-stats-grid mb-xl">
        <div className="earnings-stat-card earnings-stat-card-green">
          <div className="flex items-center gap-md">
            <div className="earnings-stat-icon earnings-stat-icon-green">📅</div>
            <div>
              <p className="earnings-stat-label">Available Days</p>
              <p className="earnings-stat-value" style={{ color: "#2E7D4F" }}>{availableDays}/7</p>
            </div>
          </div>
        </div>
        <div className="earnings-stat-card earnings-stat-card-gold">
          <div className="flex items-center gap-md">
            <div className="earnings-stat-icon earnings-stat-icon-gold">⏰</div>
            <div>
              <p className="earnings-stat-label">Avg Hours/Day</p>
              <p className="earnings-stat-value" style={{ color: "#8C7A48" }}>8.5h</p>
            </div>
          </div>
        </div>
        <div className="earnings-stat-card earnings-stat-card-amber">
          <div className="flex items-center gap-md">
            <div className="earnings-stat-icon earnings-stat-icon-amber">🟢</div>
            <div>
              <p className="earnings-stat-label">Current Status</p>
              <p className="earnings-stat-value" style={{ color: "#9C8B3D", fontSize: 18 }}>Accepting Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Card */}
      <section style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #E6E9E8",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        overflow: "hidden"
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
          padding: "14px 20px",
          background: "#F5F7F6",
          borderBottom: "1px solid #E6E9E8",
          gap: 12
        }}>
          <span className="text-sm fw-semibold">Day</span>
          <span className="text-sm fw-semibold">Status</span>
          <span className="text-sm fw-semibold">From</span>
          <span className="text-sm fw-semibold">To</span>
        </div>

        {/* Days */}
        {days.map(day => (
          <div key={day.key} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
            padding: "12px 20px",
            borderBottom: "1px solid #F5F7F6",
            alignItems: "center",
            gap: 12,
            transition: "background 0.2s",
            background: schedule[day.key].status === "available" ? "white" : "rgba(0,0,0,0.01)"
          }}>
            <div className="flex items-center gap-sm">
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: schedule[day.key].status === "available"
                  ? "rgba(75,129,91,0.1)" : "rgba(0,0,0,0.04)",
                color: schedule[day.key].status === "available" ? "#4B815B" : "#999",
                fontWeight: 700, fontSize: 12
              }}>
                {day.label.slice(0, 2)}
              </span>
              <span className="text-sm fw-medium">{day.label}</span>
            </div>

            <select
              className="input-select"
              style={{ width: "100%", padding: "8px 12px" }}
              value={schedule[day.key].status}
              onChange={e => setSchedule(prev => ({
                ...prev,
                [day.key]: { ...prev[day.key], status: e.target.value }
              }))}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <select
              className="input-select"
              style={{ width: "100%", padding: "8px 12px" }}
              value={schedule[day.key].start}
              disabled={schedule[day.key].status === "unavailable"}
              onChange={e => setSchedule(prev => ({
                ...prev,
                [day.key]: { ...prev[day.key], start: e.target.value }
              }))}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              className="input-select"
              style={{ width: "100%", padding: "8px 12px" }}
              value={schedule[day.key].end}
              disabled={schedule[day.key].status === "unavailable"}
              onChange={e => setSchedule(prev => ({
                ...prev,
                [day.key]: { ...prev[day.key], end: e.target.value }
              }))}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        ))}
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-md mt-xl">
        <button className="btn-withdraw" onClick={handleSave}>
          {saved ? "✓ Saved!" : "Save Schedule"}
        </button>
        <button className="btn-report" onClick={() => setSchedule({
          monday: { status: "available", start: "08:00", end: "17:00" },
          tuesday: { status: "available", start: "08:00", end: "17:00" },
          wednesday: { status: "available", start: "08:00", end: "17:00" },
          thursday: { status: "available", start: "08:00", end: "17:00" },
          friday: { status: "available", start: "08:00", end: "17:00" },
          saturday: { status: "unavailable", start: "08:00", end: "17:00" },
          sunday: { status: "unavailable", start: "08:00", end: "17:00" },
        })}>
          Reset to Default
        </button>
      </div>
    </main>
  );
}
