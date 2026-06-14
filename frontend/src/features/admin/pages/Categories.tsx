import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import type { Category } from "../../../types/api.types";

export default function Categories() {
  const { fetchCategories, createCategory, updateCategory, loading, error } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const loadCategories = useCallback(async () => {
    const { items } = await fetchCategories({ page: "1", limit: "100" });
    setCategories(items);
  }, [fetchCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, search]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;

    setSubmitting(true);
    const created = await createCategory({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      isActive: true,
    });
    setSubmitting(false);

    if (!created) return;

    setForm({ name: "", slug: "", description: "" });
    setShowForm(false);
    await loadCategories();
  }

  async function handleToggleActive(cat: Category) {
    setActionId(cat.id);
    const updated = await updateCategory(cat.id, { isActive: !cat.isActive });
    setActionId(null);
    if (updated) await loadCategories();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Manage service categories</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      {showForm && (
        <div className="table-container" style={{ marginBottom: "24px" }}>
          <form onSubmit={handleCreate}>
            <div className="inv-toolbar">
              <div className="inv-toolbar-left">
                <div className="inv-toolbar-title">Add Category</div>
              </div>
            </div>
            <div style={{ padding: "16px", display: "grid", gap: "12px", maxWidth: "480px" }}>
              <input
                className="inv-search"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <input
                className="inv-search"
                placeholder="Slug (e.g. farm-inputs)"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                required
              />
              <input
                className="inv-search"
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="flex gap-sm">
                <button type="submit" className="inv-action-btn inv-action-btn-success" disabled={submitting}>
                  {submitting ? "Saving..." : "Create Category"}
                </button>
                <button type="button" className="inv-action-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Categories</div>
            <div className="inv-toolbar-sub">
              {loading && categories.length === 0 ? "Loading..." : `${filtered.length} categories`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="inv-btn-create" onClick={() => setShowForm((v) => !v)}>
              <span className="inv-btn-create-icon">+</span> Add Category
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted">
                  {loading ? "Loading categories..." : "No categories found."}
                </td>
              </tr>
            ) : (
              filtered.map((cat) => (
                <tr key={cat.id}>
                  <td className="fw-medium">{cat.name}</td>
                  <td className="text-muted">{cat.slug}</td>
                  <td className="text-muted">{cat.description || "—"}</td>
                  <td>
                    {cat.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-default">Inactive</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="inv-action-btn inv-action-btn-warning"
                      disabled={actionId === cat.id}
                      onClick={() => handleToggleActive(cat)}
                    >
                      {cat.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
