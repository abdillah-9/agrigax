import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

const initialMessages = [
  { id: "1", sender: "them", text: "Hello! How can I help you today?", time: "10:30 AM" },
  { id: "2", sender: "me", text: "Hi, I need help with my booking for tractor rental", time: "10:31 AM" },
  { id: "3", sender: "them", text: "Sure! Can you share your booking ID?", time: "10:32 AM" },
  { id: "4", sender: "me", text: "It's BK-001", time: "10:33 AM" },
  { id: "5", sender: "them", text: "Got it! Your booking is confirmed for May 20th. Everything looks good on our end.", time: "10:34 AM" },
  { id: "6", sender: "them", text: "Is there anything else you need?", time: "10:34 AM" },
];

export default function ChatRoom() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "me", text: newMessage, time }]);
    setNewMessage("");

    setTimeout(() => {
      const replyTime = new Date();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "them",
        text: "Thanks for your message! I'll get back to you shortly.",
        time: replyTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      }]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="customer-page chat-room-container">
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="chat-avatar">KB</div>
        <div className="chat-header-info">
          <h2 className="chat-header-name">Kilimo Best Supplies</h2>
          <div className="chat-header-status">
            <span className="chat-online-indicator" />
            <span className="chat-status-text">Online</span>
          </div>
        </div>
        <button className="chat-end-btn">End Chat</button>
      </div>

      {/* Messages Area */}
      <section className="chat-messages-area">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message-wrapper ${msg.sender === "me" ? "chat-message-wrapper-me" : "chat-message-wrapper-them"}`}>
            <div style={{ maxWidth: "70%" }}>
              <div className={`chat-message-bubble ${msg.sender === "me" ? "chat-message-me" : "chat-message-them"}`}>
                {msg.text}
              </div>
              <p className={`chat-message-time ${msg.sender === "me" ? "chat-message-time-right" : ""}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Input Area */}
      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder="Type a message... (Enter to send)"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>
    </main>
  );
}