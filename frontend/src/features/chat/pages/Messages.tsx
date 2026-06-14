import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useMessages } from "../../../hooks/useMessages";
import { enrichConversations, messagesBasePath, type EnrichedConversation } from "../../../api/messageHelpers";
import "../styles/chat.css";

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { fetchConversations, loading, error } = useMessages();
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [search, setSearch] = useState("");

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    const rows = await fetchConversations();
    const enriched = await enrichConversations(rows, user.id);
    setConversations(enriched);
  }, [fetchConversations, user?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUserName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread, 0),
    [conversations]
  );

  const messagesPath = messagesBasePath(location.pathname);

  return (
    <main className="customer-page">
      <div className="messages-header-banner">
        <div className="messages-header-content">
          <div>
            <p className="messages-header-badge">Messages</p>
            <h1 className="messages-header-title">Conversations</h1>
            <p className="messages-header-subtitle">
              {loading && conversations.length === 0
                ? "Loading..."
                : unreadTotal > 0
                  ? `${unreadTotal} unread message${unreadTotal > 1 ? "s" : ""}`
                  : "All caught up!"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="messages-header-subtitle" style={{ color: "#b42318", padding: "0 24px" }}>
          {error}
        </p>
      )}

      <div className="messages-search-wrap">
        <input
          className="messages-search-input"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="messages-list">
        {filtered.map((conv) => (
          <div
            key={conv.id}
            className="message-conversation-card"
            onClick={() => navigate(`${messagesPath}/${conv.id}`)}
          >
            <div
              className={`conversation-avatar ${conv.unread > 0 ? "conversation-avatar-unread" : "conversation-avatar-read"}`}
            >
              {conv.avatar}
            </div>

            <div className="conversation-content">
              <div className="conversation-top-row">
                <h3 className={`conversation-name ${conv.unread > 0 ? "conversation-name-unread" : ""}`}>
                  {conv.otherUserName}
                </h3>
                <span className="conversation-time">{conv.time}</span>
              </div>
              <p className={`conversation-preview ${conv.unread > 0 ? "conversation-preview-unread" : ""}`}>
                {conv.lastMessage}
              </p>
            </div>

            {conv.unread > 0 && <span className="conversation-badge">{conv.unread}</span>}
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h3 className="chat-empty-title">
              {search ? "No conversations found" : "No conversations yet"}
            </h3>
            <p className="chat-empty-text">
              {search ? "Try adjusting your search" : "Start a chat from a listing or booking."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
