import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/listings.css";

export default function EditListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "Tractor Rental",
    description: "Professional tractor rental service for all farm sizes.",
    type: "equipment",
    category: "equipment",
    price: "120000",
    location: "Dar es Salaam",
    isAvailable: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated listing:", form);
    alert("Listing updated successfully!");
    navigate("/provider/listings");
  };

  return (
    <main className="p-xl">
      {/* Back Button */}
      <button
        className="btn btn-outline btn-sm mb-lg flex items-center gap-sm"
        onClick={() => navigate("/provider/listings")}
      >
        ← Back to My Listings
      </button>

      <section className="service-form-card shadow-md radius-lg">
        <div className="mb-xl">
          <h1 className="text-2xl fw-bold neutral-dark">Edit Listing</h1>
          <p className="text-sm mt-sm">Update your existing listing</p>
        </div>

        <form className="service-form" onSubmit={handleSubmit}>
          <div className="service-field">
            <label className="label label-required">Listing Title</label>
            <input className="input-text" type="text" value={form.title} onChange={e => handleChange("title", e.target.value)} required />
          </div>

          <div className="service-field">
            <label className="label label-required">Type</label>
            <select className="input-select" value={form.type} onChange={e => handleChange("type", e.target.value)}>
              <option value="service">Service</option>
              <option value="product">Product</option>
              <option value="equipment">Equipment</option>
              <option value="livestock">Livestock</option>
              <option value="worker">Worker / Labor</option>
            </select>
          </div>

          <div className="service-field">
            <label className="label label-required">Category</label>
            <select className="input-select" value={form.category} onChange={e => handleChange("category", e.target.value)} required>
              <option value="">Select category</option>
              <option value="farm-inputs">Farm Inputs</option>
              <option value="equipment">Equipment</option>
              <option value="labor">Labor</option>
              <option value="livestock">Livestock</option>
              <option value="technology">Technology</option>
              <option value="transport">Transport</option>
            </select>
          </div>

          <div className="service-field">
            <label className="label label-required">Price (TZS)</label>
            <input className="input-text" type="number" value={form.price} onChange={e => handleChange("price", e.target.value)} required />
          </div>

          <div className="service-field">
            <label className="label label-required">Location</label>
            <input className="input-text" type="text" value={form.location} onChange={e => handleChange("location", e.target.value)} />
          </div>

          <div className="service-field">
            <label className="label label-required">Description</label>
            <textarea className="input-textarea" value={form.description} onChange={e => handleChange("description", e.target.value)} />
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input className="input-checkbox" type="checkbox" checked={form.isAvailable} onChange={e => handleChange("isAvailable", e.target.checked)} />
              Available for booking
            </label>
          </div>

          <div className="flex gap-md" style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary">Update Listing</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/provider/listings")}>Cancel</button>
          </div>
        </form>
      </section>
    </main>
  );
}
