import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

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
    <main className="customer-page">
      {/* Header Banner */}
      <div className="messages-header-banner">
        <div className="messages-header-content">
          <div>
            <p className="messages-header-badge">Messages</p>
            <h1 className="messages-header-title">Conversations</h1>
            <p className="messages-header-subtitle">
              {unreadTotal > 0 
                ? `${unreadTotal} unread message${unreadTotal > 1 ? 's' : ''}` 
                : 'All caught up! ✨'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="messages-search-wrap">
        <input
          className="messages-search-input"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Conversation List */}
      <section className="messages-list">
        {filtered.map(conv => (
          <div
            key={conv.id}
            className="message-conversation-card"
            onClick={() => navigate(`/app/messages/${conv.id}`)}
          >
            {/* Avatar */}
            <div className={`conversation-avatar ${conv.unread > 0 ? 'conversation-avatar-unread' : 'conversation-avatar-read'}`}>
              {conv.avatar}
              {conv.online && <div className="conversation-online-dot" />}
            </div>

            {/* Content */}
            <div className="conversation-content">
              <div className="conversation-top-row">
                <h3 className={`conversation-name ${conv.unread > 0 ? 'conversation-name-unread' : ''}`}>
                  {conv.name}
                </h3>
                <span className="conversation-time">{conv.time}</span>
              </div>
              <p className={`conversation-preview ${conv.unread > 0 ? 'conversation-preview-unread' : ''}`}>
                {conv.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span className="conversation-badge">{conv.unread}</span>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h3 className="chat-empty-title">No conversations found</h3>
            <p className="chat-empty-text">Try adjusting your search</p>
          </div>
        )}
      </section>
    </main>
  );
}