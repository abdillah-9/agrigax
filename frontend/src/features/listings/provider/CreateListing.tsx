import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiPlus, HiCheck } from "react-icons/hi2";
import { useCategories } from "../../../hooks/useCategories";
import { useListings } from "../../../hooks/useListings";
import type { Category } from "../../../types/api.types";
import "../styles/listings.css";

export default function CreateListing() {
  const navigate = useNavigate();
  const { fetchCategories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { createListing, loading, error } = useListings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "service",
    categoryId: "",
    price: "",
    location: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, [fetchCategories]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const categoryId = Number(form.categoryId);
    if (!categoryId) return;

    const result = await createListing({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      categoryId,
      price: Number(form.price),
      location: form.location.trim(),
      isAvailable: form.isAvailable,
    });

    if (!result) return;

    navigate("/provider/listings");
  }

  return (
    <main className="customer-page" style={{ maxWidth: 720 }}>
      <button className="back-nav-btn" onClick={() => navigate("/provider/listings")}>
        <HiArrowLeft />
        Back to My Listings
      </button>

      <section className="listing-form-card">
        <div className="listing-form-header">
          <div className="listing-form-header-icon">
            <HiPlus />
          </div>
          <div>
            <h1 className="listing-form-title">Create Listing</h1>
            <p className="listing-form-subtitle">Add a new service to your provider profile</p>
          </div>
        </div>

        {(error || categoriesError) && (
          <p className="listing-form-subtitle" style={{ color: "#b42318" }}>
            {error || categoriesError}
          </p>
        )}

        {!categoriesLoading && categories.length === 0 && !categoriesError && (
          <p className="listing-form-subtitle" style={{ color: "#9a3412" }}>
            No categories available yet. Ask an admin to add categories first.
          </p>
        )}

        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="listing-form-grid">
            <div className="listing-form-field listing-form-field-full">
              <label className="label label-required">Listing Title</label>
              <input
                className="input-text"
                type="text"
                placeholder="e.g. Tractor Rental"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="listing-form-field">
              <label className="label label-required">Type</label>
              <select
                className="input-select"
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value="service">Service</option>
                <option value="product">Product</option>
                <option value="equipment">Equipment</option>
                <option value="livestock">Livestock</option>
                <option value="worker">Worker / Labor</option>
              </select>
            </div>

            <div className="listing-form-field">
              <label className="label label-required">Category</label>
              <select
                className="input-select"
                value={form.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
                required
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="listing-form-field">
              <label className="label label-required">Price (TZS)</label>
              <input
                className="input-text"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter price"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
            </div>

            <div className="listing-form-field">
              <label className="label label-required">Location</label>
              <input
                className="input-text"
                type="text"
                placeholder="e.g. Dar es Salaam"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
            </div>

            <div className="listing-form-field listing-form-field-full">
              <label className="label label-required">Description</label>
              <textarea
                className="input-textarea"
                rows={4}
                placeholder="Describe your listing..."
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="listing-form-checkbox">
            <label className="checkbox-label">
              <input
                className="input-checkbox"
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => handleChange("isAvailable", e.target.checked)}
              />
              <span className="checkbox-custom" />
              Available for booking
            </label>
          </div>

          <div className="listing-form-actions">
            <button type="submit" className="btn-withdraw" disabled={loading || categoriesLoading}>
              <HiCheck className="dash-btn-icon" />
              {loading ? "Creating..." : "Create Listing"}
            </button>
            <button type="button" className="btn-report" onClick={() => navigate("/provider/listings")}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
