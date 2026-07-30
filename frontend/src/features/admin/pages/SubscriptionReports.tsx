import { useCallback, useEffect, useState } from "react";
import { useAdminSubscriptions } from "../../../hooks/useAdminSubscriptions";
import { formatMoney } from "../../../api/subscriptionHelpers";
import type {
  ExpirationsReport,
  RequestCountsReport,
  RevenueReport,
  VendorCountsReport,
} from "../../../types/api.types";
import "../../subscriptions/styles/subscriptions.css";

export default function SubscriptionReports() {
  const {
    fetchRevenueReport,
    fetchVendorCounts,
    fetchRequestCounts,
    fetchExpirationsReport,
    error,
  } = useAdminSubscriptions();

  const [totalRevenue, setTotalRevenue] = useState<RevenueReport | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueReport | null>(null);
  const [yearlyRevenue, setYearlyRevenue] = useState<RevenueReport | null>(null);
  const [vendors, setVendors] = useState<VendorCountsReport | null>(null);
  const [requestCounts, setRequestCounts] = useState<RequestCountsReport | null>(null);
  const [expirations, setExpirations] = useState<ExpirationsReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [total, monthly, yearly, vendorCounts, reqCounts, exp] = await Promise.all([
      fetchRevenueReport("total"),
      fetchRevenueReport("monthly"),
      fetchRevenueReport("yearly"),
      fetchVendorCounts(),
      fetchRequestCounts(),
      fetchExpirationsReport(),
    ]);

    setTotalRevenue(total);
    setMonthlyRevenue(monthly);
    setYearlyRevenue(yearly);
    setVendors(vendorCounts);
    setRequestCounts(reqCounts);
    setExpirations(exp);
    setLoading(false);
  }, [fetchRevenueReport, fetchVendorCounts, fetchRequestCounts, fetchExpirationsReport]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscription Reports</h1>
        <p className="page-subtitle">
          Revenue and vendor insights — derived from approved subscription requests
        </p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <p className="stat-label">Total Revenue (all time)</p>
            <p className="stat-value">
              {loading ? "—" : formatMoney(totalRevenue?.total ?? 0)}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Active Vendors</p>
            <p className="stat-value">{loading ? "—" : vendors?.activeVendors ?? 0}</p>
            <p className="stat-change text-muted">
              {loading
                ? ""
                : `${vendors?.starterVendors ?? 0} on Starter · ${vendors?.paidVendors ?? 0} on paid plans`}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Pending Requests</p>
            <p className="stat-value">{loading ? "—" : requestCounts?.pending ?? 0}</p>
            <p className="stat-change text-muted">
              {loading
                ? ""
                : `${requestCounts?.approved ?? 0} approved · ${requestCounts?.rejected ?? 0} rejected`}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Expirations</p>
            <p className="stat-value">{loading ? "—" : expirations?.expiredCount ?? 0}</p>
            <p className="stat-change text-muted">
              {loading
                ? ""
                : `${expirations?.upcoming.in7Days ?? 0} expiring in 7 days · ${expirations?.upcoming.in3Days ?? 0} in 3 days`}
            </p>
          </div>
        </div>
      </div>

      <div className="sub-plans-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
        <div className="table-container">
          <div className="inv-toolbar">
            <div className="inv-toolbar-left">
              <div className="inv-toolbar-title">Monthly Revenue</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {!monthlyRevenue?.data?.length ? (
                <tr>
                  <td colSpan={2} className="text-muted">
                    {loading ? "Loading..." : "No approved payments yet."}
                  </td>
                </tr>
              ) : (
                monthlyRevenue.data.map((row) => (
                  <tr key={String(row.period)}>
                    <td className="fw-medium">{row.period}</td>
                    <td>{formatMoney(Number(row.revenue))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="inv-toolbar">
            <div className="inv-toolbar-left">
              <div className="inv-toolbar-title">Yearly Revenue</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {!yearlyRevenue?.data?.length ? (
                <tr>
                  <td colSpan={2} className="text-muted">
                    {loading ? "Loading..." : "No approved payments yet."}
                  </td>
                </tr>
              ) : (
                yearlyRevenue.data.map((row) => (
                  <tr key={String(row.period)}>
                    <td className="fw-medium">{row.period}</td>
                    <td>{formatMoney(Number(row.revenue))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
