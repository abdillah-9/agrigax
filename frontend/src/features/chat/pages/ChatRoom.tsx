import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useMessages } from "../../../hooks/useMessages";
import {
  formatMessageTime,
  messagesBasePath,
  resolveChatPartner,
} from "../../../api/messageHelpers";
import type { Message } from "../../../types/api.types";
import "../styles/chat.css";

export default function ChatRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const { fetchConversations, fetchMessages, sendMessage, loading, error } = useMessages();

  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerName, setPartnerName] = useState("Conversation");
  const [partnerAvatar, setPartnerAvatar] = useState("?");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChat = useCallback(async () => {
    if (!id || !user?.id) return;

    const [conversations, rows] = await Promise.all([
      fetchConversations(),
      fetchMessages(id),
    ]);

    const conv = conversations.find((c) => c.id === id) ?? null;
    setMessages(rows);

    const partner = await resolveChatPartner(conv, rows, user.id);
    setPartnerName(partner.name);
    setPartnerAvatar(partner.avatar);
  }, [fetchConversations, fetchMessages, id, user?.id]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!id || !newMessage.trim() || sending) return;

    setSending(true);
    const sent = await sendMessage(id, { text: newMessage.trim() });
    setSending(false);

    if (sent) {
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const messagesPath = messagesBasePath(location.pathname);

  return (
    <main className="customer-page chat-room-container">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate(messagesPath)}>
          ← Back
        </button>
        <div className="chat-avatar">{partnerAvatar}</div>
        <div className="chat-header-info">
          <h2 className="chat-header-name">{partnerName}</h2>
          <div className="chat-header-status">
            <span className="chat-status-text">Messages</span>
          </div>
        </div>
      </div>

      {error && (
        <p style={{ color: "#b42318", padding: "8px 16px", margin: 0 }}>{error}</p>
      )}

      <section className="chat-messages-area">
        {loading && messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading messages...</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`chat-message-wrapper ${isMe ? "chat-message-wrapper-me" : "chat-message-wrapper-them"}`}
              >
                <div style={{ maxWidth: "70%" }}>
                  <div
                    className={`chat-message-bubble ${isMe ? "chat-message-me" : "chat-message-them"}`}
                  >
                    {msg.text}
                  </div>
                  <p className={`chat-message-time ${isMe ? "chat-message-time-right" : ""}`}>
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </section>

      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder="Type a message... (Enter to send)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!id}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!newMessage.trim() || sending || !id}
        >
          Send
        </button>
      </div>
    </main>
  );
}
