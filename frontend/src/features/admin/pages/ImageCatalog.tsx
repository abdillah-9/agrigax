import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminCatalog } from "../../../hooks/useCatalog";
import type { CatalogImage, CatalogImageRequest } from "../../../types/api.types";
import "../../subscriptions/styles/subscriptions.css";

const emptyForm = {
  name: "",
  keywords: "",
  url: "",
  isActive: true,
};

type ImageForm = typeof emptyForm;

function imageToForm(image: CatalogImage): ImageForm {
  return {
    name: image.name,
    keywords: image.keywords || "",
    url: image.url,
    isActive: image.isActive,
  };
}

export default function ImageCatalog() {
  const {
    fetchImages,
    createImage,
    updateImage,
    deleteImage,
    fetchRequests,
    resolveRequest,
    loading,
    error,
  } = useAdminCatalog();

  const [images, setImages] = useState<CatalogImage[]>([]);
  const [requests, setRequests] = useState<CatalogImageRequest[]>([]);
  const [editing, setEditing] = useState<CatalogImage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ImageForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [{ items }, reqs] = await Promise.all([fetchImages(1, 200), fetchRequests()]);
    setImages(items);
    setRequests(reqs);
  }, [fetchImages, fetchRequests]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function openCreate(term?: string) {
    setEditing(null);
    setForm({ ...emptyForm, name: term || "", keywords: term || "" });
    setShowForm(true);
  }

  function openEdit(image: CatalogImage) {
    setEditing(image);
    setForm(imageToForm(image));
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      keywords: form.keywords.trim(),
      url: form.url.trim(),
      isActive: form.isActive,
    };

    setSubmitting(true);
    const result = editing
      ? await updateImage(editing.id, payload)
      : await createImage(payload);
    setSubmitting(false);

    if (!result) return;

    setShowForm(false);
    await loadAll();
  }

  async function handleToggleActive(image: CatalogImage) {
    setActionId(image.id);
    const updated = await updateImage(image.id, { isActive: !image.isActive });
    setActionId(null);
    if (updated) await loadAll();
  }

  async function handleDelete(image: CatalogImage) {
    if (!window.confirm(`Delete "${image.name}" from the catalog?`)) return;
    setActionId(image.id);
    const ok = await deleteImage(image.id);
    setActionId(null);
    if (ok) await loadAll();
  }

  async function handleResolve(request: CatalogImageRequest, status: "added" | "dismissed") {
    setActionId(request.id);
    const updated = await resolveRequest(request.id, status);
    setActionId(null);
    if (updated) await loadAll();
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Image Catalog</h1>
        <p className="page-subtitle">
          The curated pictures vendors choose from when creating a listing — no user uploads
        </p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container" style={{ marginBottom: 24 }}>
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Missed Searches &amp; Vendor Requests</div>
            <div className="inv-toolbar-sub">
              {pendingRequests.length === 0
                ? "Nothing pending — vendors are finding what they need"
                : `${pendingRequests.length} pending — sorted by demand`}
            </div>
          </div>
        </div>
        {pendingRequests.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Searched term</th>
                <th>Times searched</th>
                <th>Explicit request?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id}>
                  <td className="fw-medium">{request.term}</td>
                  <td>{request.hits}</td>
                  <td>
                    {request.requested ? (
                      <span className="badge badge-warning">Vendor asked</span>
                    ) : (
                      <span className="badge badge-default">Silent miss</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="inv-action-btn" onClick={() => openCreate(request.term)}>
                        Add Image
                      </button>
                      <button
                        className="inv-action-btn inv-action-btn-success"
                        disabled={actionId === request.id}
                        onClick={() => handleResolve(request, "added")}
                      >
                        Mark Added
                      </button>
                      <button
                        className="inv-action-btn inv-action-btn-warning"
                        disabled={actionId === request.id}
                        onClick={() => handleResolve(request, "dismissed")}
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Catalog Images</div>
            <div className="inv-toolbar-sub">
              {loading && images.length === 0 ? "Loading..." : `${images.length} images`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <button className="inv-btn-create" onClick={() => openCreate()}>
              <span className="inv-btn-create-icon">+</span> Add Image
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Name</th>
              <th>Search keywords</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted">
                  {loading ? "Loading catalog..." : "No images yet."}
                </td>
              </tr>
            ) : (
              images.map((image) => (
                <tr key={image.id}>
                  <td>
                    <img
                      src={image.url}
                      alt={image.name}
                      style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 6 }}
                    />
                  </td>
                  <td className="fw-medium">{image.name}</td>
                  <td className="text-muted">{image.keywords || "—"}</td>
                  <td>
                    {image.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-default">Hidden</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="inv-action-btn" onClick={() => openEdit(image)}>
                        Edit
                      </button>
                      <button
                        className="inv-action-btn inv-action-btn-warning"
                        disabled={actionId === image.id}
                        onClick={() => handleToggleActive(image)}
                      >
                        {image.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        className="inv-action-btn inv-action-btn-danger"
                        disabled={actionId === image.id}
                        onClick={() => handleDelete(image)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="inv-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div className="inv-modal-header-left">
                <div className="inv-modal-title">
                  {editing ? `Edit Image — ${editing.name}` : "Add Catalog Image"}
                </div>
              </div>
              <button className="inv-modal-close" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="inv-modal-body">
                <div className="sub-form-grid">
                  <label>
                    Product name
                    <input
                      placeholder="e.g. Beans"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Search keywords (comma separated)
                    <input
                      placeholder="e.g. maharage,haricot,kunde"
                      value={form.keywords}
                      onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))}
                    />
                  </label>
                  <label>
                    Image path or URL
                    <input
                      placeholder="e.g. /catalog/beans.svg"
                      value={form.url}
                      onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                      required
                    />
                  </label>
                  {form.url.trim() && (
                    <img
                      src={form.url.trim()}
                      alt="Preview"
                      style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 8 }}
                    />
                  )}
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    />
                    Active (visible to vendors)
                  </label>
                </div>
              </div>
              <div className="inv-modal-footer">
                <button type="button" className="inv-btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="inv-btn-submit" disabled={submitting}>
                  {submitting ? "Saving..." : editing ? "Save Changes" : "Add Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
