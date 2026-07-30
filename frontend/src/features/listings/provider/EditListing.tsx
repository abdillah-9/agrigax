import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft, HiPencilSquare, HiCheck } from "react-icons/hi2";
import { useCategories } from "../../../hooks/useCategories";
import { useListings } from "../../../hooks/useListings";
import CatalogImagePicker from "../components/CatalogImagePicker";
import LocationPicker, { type PickedLocation } from "../components/LocationPicker";
import type { Category, Listing } from "../../../types/api.types";
import "../styles/listings.css";

export default function EditListing() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchMyListings, updateListing, loading, error } = useListings();
  const { fetchCategories, loading: categoriesLoading } = useCategories();

  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "service",
    categoryId: "",
    price: "",
    isAvailable: true,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [place, setPlace] = useState<PickedLocation>({
    location: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, [fetchCategories]);

  useEffect(() => {
    if (!id) return;

    async function loadListing() {
      setInitialLoading(true);
      const items = await fetchMyListings();
      const listing = items.find((item: Listing) => item.id === id);

      if (listing) {
        setForm({
          title: listing.title,
          description: listing.description,
          type: listing.type,
          categoryId: listing.categoryId || "",
          price: String(listing.price),
          isAvailable: listing.isAvailable,
        });
        setImageUrl(listing.images?.[0] || "");
        setPlace({
          location: listing.location,
          latitude: listing.latitude,
          longitude: listing.longitude,
        });
      }

      setInitialLoading(false);
    }

    loadListing();
  }, [id, fetchMyListings]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;

    const categoryId = Number(form.categoryId);
    if (!categoryId) return;

    const result = await updateListing(id, {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      categoryId,
      price: Number(form.price),
      location: place.location.trim(),
      latitude: place.latitude,
      longitude: place.longitude,
      isAvailable: form.isAvailable,
      images: imageUrl ? [imageUrl] : [],
    });

    if (!result) return;

    navigate("/provider/listings");
  }

  if (initialLoading) {
    return (
      <main className="customer-page" style={{ maxWidth: 720 }}>
        <p className="listings-count-text">Loading listing...</p>
      </main>
    );
  }

  if (!form.title && !loading) {
    return (
      <main className="customer-page" style={{ maxWidth: 720 }}>
        <button className="back-nav-btn" onClick={() => navigate("/provider/listings")}>
          <HiArrowLeft />
          Back to My Listings
        </button>
        <div className="listings-empty">
          <h3 className="listings-empty-title">Listing not found</h3>
          <p className="listings-empty-text">This listing may have been deleted.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="customer-page" style={{ maxWidth: 720 }}>
      <button className="back-nav-btn" onClick={() => navigate("/provider/listings")}>
        <HiArrowLeft />
        Back to My Listings
      </button>

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

        {error && <p className="listing-form-subtitle" style={{ color: "#b42318" }}>{error}</p>}

        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="listing-form-grid">
            <div className="listing-form-field listing-form-field-full">
              <label className="label label-required">Listing Title</label>
              <input
                className="input-text"
                type="text"
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
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
            </div>

            <div className="listing-form-field listing-form-field-full">
              <label className="label label-required">Location</label>
              <LocationPicker value={place} onChange={setPlace} />
            </div>

            <div className="listing-form-field listing-form-field-full">
              <label className="label label-required">Description</label>
              <textarea
                className="input-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>

            <div className="listing-form-field listing-form-field-full">
              <label className="label">Picture</label>
              <CatalogImagePicker value={imageUrl} onChange={setImageUrl} />
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
              {loading ? "Saving..." : "Update Listing"}
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
