import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiPencilSquare, HiCheck } from "react-icons/hi2";
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
    <main className="customer-page" style={{ maxWidth: 720 }}>
      {/* Back Button */}
      <button className="back-nav-btn" onClick={() => navigate("/provider/listings")}>
        <HiArrowLeft />
        Back to My Listings
      </button>

      {/* Form Card */}
      <section className="listing-form-card">
        <div className="listing-form-header">
          <div className="listing-form-header-icon listing-form-header-icon-edit">
            <HiPencilSquare />
          </div>
          <div>
            <h1 className="listing-form-title">Edit Listing</h1>
            <p className="listing-form-subtitle">Update your existing listing details</p>
          </div>
        </div>

        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="listing-form-grid">
            <div className="listing-form-field listing-form-field-full">
              <label className="label label-required">Listing Title</label>
              <input className="input-text" type="text" value={form.title} onChange={e => handleChange("title", e.target.value)} required />
            </div>

            <div className="listing-form-field">
              <label className="label label-required">Type</label>
              <select className="input-select" value={form.type} onChange={e => handleChange("type", e.target.value)}>
                <option value="service">Service</option>
                <option value="product">Product</option>
                <option value="equipment">Equipment</option>
                <option value="livestock">Livestock</option>
                <option value="worker">Worker / Labor</option>
              </select>
            </div>

            <div className="listing-form-field">
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

            <div className="listing-form-field">
              <label className="label label-required">Price (TZS)</label>
              <input className="input-text" type="number" value={form.price} onChange={e => handleChange("price", e.target.value)} required />
            </div>

            <div className="listing-form-field">
              <label className="label label-required">Location</label>
              <input className="input-text" type="text" value={form.location} onChange={e => handleChange("location", e.target.value)} />
            </div>

            <div className="listing-form-field listing-form-field-full">
              <label className="label label-required">Description</label>
              <textarea className="input-textarea" rows={4} value={form.description} onChange={e => handleChange("description", e.target.value)} />
            </div>
          </div>

          <div className="listing-form-checkbox">
            <label className="checkbox-label">
              <input className="input-checkbox" type="checkbox" checked={form.isAvailable} onChange={e => handleChange("isAvailable", e.target.checked)} />
              <span className="checkbox-custom" />
              Available for booking
            </label>
          </div>

          <div className="listing-form-actions">
            <button type="submit" className="btn-withdraw">
              <HiCheck className="dash-btn-icon" /> Update Listing
            </button>
            <button type="button" className="btn-report" onClick={() => navigate("/provider/listings")}>Cancel</button>
          </div>
        </form>
      </section>
    </main>
  );
}
