import { useState } from "react";
import { useNavigate } from "react-router-dom";

const conversations = [
  { id: "1", name: "Kilimo Best Supplies", lastMessage: "Your booking is confirmed for May 20th", time: "2 min ago", unread: 2, online: true, avatar: "KB" },
  { id: "2", name: "Customer Care", lastMessage: "We are reviewing your refund request", time: "1 hour ago", unread: 0, online: true, avatar: "CC" },
  { id: "3", name: "AgriPro Solutions", lastMessage: "Thank you for your order!", time: "3 hours ago", unread: 0, online: false, avatar: "AP" },
  { id: "4", name: "Farm Help Services", lastMessage: "I'll be available on Friday", time: "Yesterday", unread: 1, online: true, avatar: "FH" },
  { id: "5", name: "Green Tech Agri", lastMessage: "Payment received, thank you", time: "2 days ago", unread: 0, online: false, avatar: "GT" },
];

export default function Messages() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <main className="p-xl">
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="text-2xl fw-bold neutral-dark">Messages</h1>
          <p className="text-sm text-muted mt-sm">
            {unreadTotal > 0 ? `${unreadTotal} unread message${unreadTotal > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="inv-search-wrap mb-lg">
        <input
          className="inv-search"
          style={{ width: "100%", maxWidth: 400 }}
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Conversation List */}
      <section className="flex flex-col gap-md">
        {filtered.map(conv => (
          <div
            key={conv.id}
            className="flex items-center gap-md p-lg pointer"
            style={{
              background: "white",
              borderRadius: 12,
              border: "1px solid #E6E9E8",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              transition: "all 0.2s ease",
            }}
            onClick={() => navigate(`/provider/messages/${conv.id}`)}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(75,129,91,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.03)")}
          >
            {/* Avatar */}
            <div style={{
              width: 48, height: 48, minWidth: 48,
              borderRadius: 12,
              background: conv.unread > 0
                ? "linear-gradient(135deg, #4B815B, #2E7D4F)"
                : "linear-gradient(135deg, #E6E9E8, #D1D5D3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: conv.unread > 0 ? "white" : "#666",
              fontWeight: 700,
              fontSize: 14,
              position: "relative"
            }}>
              {conv.avatar}
              {conv.online && (
                <div style={{
                  position: "absolute", bottom: -2, right: -2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: "#2E7D4F", border: "2px solid white"
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex justify-between items-center">
                <h3 className={`text-sm ${conv.unread > 0 ? "fw-bold" : "fw-semibold"}`}>
                  {conv.name}
                </h3>
                <span className="text-xs text-muted">{conv.time}</span>
              </div>
              <p className={`text-sm mt-xs ${conv.unread > 0 ? "" : "text-muted"}`} style={{
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>
                {conv.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span style={{
                minWidth: 24, height: 24,
                borderRadius: "50%",
                background: "#4B815B",
                color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700
              }}>
                {conv.unread}
              </span>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="table-empty">
            <p>No conversations found.</p>
          </div>
        )}
      </section>
    </main>
  );
}
