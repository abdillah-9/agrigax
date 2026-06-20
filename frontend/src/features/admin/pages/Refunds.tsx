import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import type { AdminPayment } from "../../../types/api.types";

export default function Refunds() {
  const { fetchRefunds, loading, error } = useAdmin();
  const [refunds, setRefunds] = useState<AdminPayment[]>([]);
  const [search, setSearch] = useState("");

  const loadRefunds = useCallback(async () => {
    const { items } = await fetchRefunds({ page: "1", limit: "100" });
    setRefunds(items);
  }, [fetchRefunds]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return refunds.filter(
      (r) =>
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.providerName || "").toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [refunds, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Refunds</h1>
        <p className="page-subtitle">Refunded payment records from the platform</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Refunded Payments</div>
            <div className="inv-toolbar-sub">
              {loading && refunds.length === 0 ? "Loading..." : `${filtered.length} refunds`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search refunds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Refunded On</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted">
                  {loading ? "Loading refunds..." : "No refunded payments found."}
                </td>
              </tr>
            ) : (
              filtered.map((refund) => (
                <tr key={refund.id}>
                  <td className="fw-medium">{refund.id}</td>
                  <td>{refund.bookingId}</td>
                  <td>{refund.customerName || "—"}</td>
                  <td>{refund.providerName || "—"}</td>
                  <td>TZS {refund.amount.toLocaleString()}</td>
                  <td><span className="badge badge-default">{refund.method || "—"}</span></td>
                  <td>{formatAdminDate(refund.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
