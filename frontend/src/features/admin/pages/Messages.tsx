import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "../../../hooks/useAdmin";
import { formatAdminDate } from "../../../api/adminHelpers";
import type { AdminConversation } from "../../../types/api.types";

export default function Messages() {
  const { fetchConversations, loading, error } = useAdmin();
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [search, setSearch] = useState("");

  const loadConversations = useCallback(async () => {
    const { items } = await fetchConversations({ page: "1", limit: "100" });
    setConversations(items);
  }, [fetchConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.userOneName || "").toLowerCase().includes(q) ||
        (c.userTwoName || "").toLowerCase().includes(q) ||
        (c.listingTitle || "").toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Monitor platform conversations</p>
      </div>

      {error && <p className="page-subtitle" style={{ color: "#b42318" }}>{error}</p>}

      <div className="table-container">
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            <div className="inv-toolbar-title">Conversations</div>
            <div className="inv-toolbar-sub">
              {loading && conversations.length === 0 ? "Loading..." : `${filtered.length} conversations`}
            </div>
          </div>
          <div className="inv-toolbar-right">
            <div className="inv-search-wrap">
              <input
                className="inv-search"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Participant 1</th>
              <th>Participant 2</th>
              <th>Listing</th>
              <th>Last Activity</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">
                  {loading ? "Loading conversations..." : "No conversations found."}
                </td>
              </tr>
            ) : (
              filtered.map((conversation) => (
                <tr key={conversation.id}>
                  <td className="fw-medium">{conversation.id}</td>
                  <td>{conversation.userOneName || conversation.userOneId}</td>
                  <td>{conversation.userTwoName || conversation.userTwoId}</td>
                  <td>{conversation.listingTitle || "—"}</td>
                  <td>{formatAdminDate(conversation.lastMessageAt)}</td>
                  <td>{formatAdminDate(conversation.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
