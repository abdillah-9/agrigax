import { useState } from "react";
import {
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiCheck,
} from "react-icons/hi2";
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

const timeOptions = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

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

  const handleReset = () => {
    setSchedule({
      monday: { status: "available", start: "08:00", end: "17:00" },
      tuesday: { status: "available", start: "08:00", end: "17:00" },
      wednesday: { status: "available", start: "08:00", end: "17:00" },
      thursday: { status: "available", start: "08:00", end: "17:00" },
      friday: { status: "available", start: "08:00", end: "17:00" },
      saturday: { status: "unavailable", start: "08:00", end: "17:00" },
      sunday: { status: "unavailable", start: "08:00", end: "17:00" },
    });
  };

  const availableDays = Object.values(schedule).filter(d => d.status === "available").length;

  return (
    <main className="customer-page">
      {/* Page Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Availability</h1>
        <p className="customer-page-subtitle">
          Configure your working schedule · {availableDays} days available
        </p>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-grid">
        <div className="dash-stat-card dash-stat-green">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-green">
              <HiCalendar />
            </div>
            <div>
              <p className="dash-stat-label">Available Days</p>
              <p className="dash-stat-value dash-stat-value-green">{availableDays}<span className="dash-stat-unit">/7</span></p>
            </div>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-gold">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-gold">
              <HiClock />
            </div>
            <div>
              <p className="dash-stat-label">Avg Hours / Day</p>
              <p className="dash-stat-value dash-stat-value-gold">8.5<span className="dash-stat-unit">h</span></p>
            </div>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-amber">
          <div className="dash-stat-row">
            <div className="dash-stat-icon-wrap dash-stat-icon-amber">
              <HiCheckCircle />
            </div>
            <div>
              <p className="dash-stat-label">Current Status</p>
              <p className="dash-stat-value dash-stat-value-amber availability-status-text">Accepting Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-section-title">Weekly Schedule</h2>
            <p className="dash-section-subtitle">Set your availability for each day</p>
          </div>
        </div>

        <div className="availability-table-card">
          {/* Table Header */}
          <div className="availability-table-header">
            <span>Day</span>
            <span>Status</span>
            <span>From</span>
            <span>To</span>
          </div>

          {/* Table Rows */}
          {days.map(day => {
            const isAvailable = schedule[day.key].status === "available";
            return (
              <div key={day.key} className={`availability-table-row ${isAvailable ? "row-active" : "row-inactive"}`}>
                <div className="availability-day-cell">
                  <span className={`availability-day-badge ${isAvailable ? "badge-active" : "badge-inactive"}`}>
                    {day.label.slice(0, 2)}
                  </span>
                  <span className="availability-day-label">{day.label}</span>
                </div>

                <select
                  className="input-select availability-select"
                  value={schedule[day.key].status}
                  onChange={e => setSchedule(prev => ({
                    ...prev,
                    [day.key]: { ...prev[day.key], status: e.target.value },
                  }))}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>

                <select
                  className="input-select availability-select"
                  value={schedule[day.key].start}
                  disabled={!isAvailable}
                  onChange={e => setSchedule(prev => ({
                    ...prev,
                    [day.key]: { ...prev[day.key], start: e.target.value },
                  }))}
                >
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select
                  className="input-select availability-select"
                  value={schedule[day.key].end}
                  disabled={!isAvailable}
                  onChange={e => setSchedule(prev => ({
                    ...prev,
                    [day.key]: { ...prev[day.key], end: e.target.value },
                  }))}
                >
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="availability-actions">
        <button className="btn-withdraw" onClick={handleSave}>
          {saved ? (
            <><HiCheck className="dash-btn-icon" /> Saved!</>
          ) : (
            "Save Schedule"
          )}
        </button>
        <button className="btn-report" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </main>
  );
}
