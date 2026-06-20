import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import type { AdminProvider } from "../../../types/api.types";

export default function Providers() {
  const { fetchProviders, loading, error } = useAdmin();
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [search, setSearch] = useState("");

  const loadProviders = useCallback(async () => {
    const params: Record<string, string> = { page: "1", limit: "100" };
    if (search.trim()) params.search = search.trim();
    const { items } = await fetchProviders(params);
    setProviders(items);
  }, [fetchProviders, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProviders();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProviders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return providers.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
    );
  }, [providers, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Provider Management</h1>
        <p className="page-subtitle">Manage service providers on the platform</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">All Providers</div>
            <div className="inv-toolbar-sub">
              {loading && providers.length === 0 ? "Loading..." : `${filtered.length} providers`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Username</th>
              <th>Phone</th>
              <th>Listings</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  {loading ? "Loading providers..." : "No providers found."}
                </td>
              </tr>
            ) : (
              filtered.map((provider) => (
                <tr key={provider.id}>
                  <td className="fw-medium">{provider.fullName}</td>
                  <td>{provider.username}</td>
                  <td>{provider.phone}</td>
                  <td>{provider.totalListings}</td>
                  <td>
                    {provider.isSuspended ? (
                      <span className="badge badge-danger">Suspended</span>
                    ) : provider.isVerified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : (
                      <span className="badge badge-warning">Unverified</span>
                    )}
                  </td>
                  <td>{formatAdminDate(provider.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
