import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    // Simulate reply
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
    <main className="p-xl flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div className="flex items-center gap-md mb-lg" style={{
        background: "white",
        borderRadius: 12,
        padding: "14px 20px",
        border: "1px solid #E6E9E8",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <button
          className="btn btn-outline btn-sm flex items-center gap-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #4B815B, #2E7D4F)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 14
        }}>KB</div>
        <div style={{ flex: 1 }}>
          <h2 className="fw-bold text-sm">Kilimo Best Supplies</h2>
          <div className="flex items-center gap-sm">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2E7D4F" }} />
            <span className="text-xs text-muted">Online</span>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ color: "#D64545", borderColor: "#FBE3E3" }}>
          End Chat
        </button>
      </div>

      {/* Messages Area */}
      <section className="flex flex-col gap-md" style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
        {messages.map(msg => (
          <div key={msg.id} className="flex" style={{ justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "70%" }}>
              <div style={{
                padding: "12px 16px",
                borderRadius: msg.sender === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.sender === "me"
                  ? "linear-gradient(135deg, #4B815B, #3E6E52)"
                  : "#F5F7F6",
                color: msg.sender === "me" ? "white" : "#181818",
                fontSize: 14,
                lineHeight: 1.5,
                boxShadow: msg.sender === "me"
                  ? "0 2px 8px rgba(75, 129, 91, 0.25)"
                  : "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                {msg.text}
              </div>
              <p className={`text-xs text-muted mt-xs ${msg.sender === "me" ? "text-right" : ""}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Input Area */}
      <div className="flex gap-sm" style={{
        background: "white",
        borderRadius: 12,
        padding: 12,
        border: "1px solid #E6E9E8",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.04)"
      }}>
        <input
          className="input-text"
          style={{ flex: 1, border: "none", background: "transparent" }}
          placeholder="Type a message... (Enter to send)"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!newMessage.trim()}
          style={{ padding: "10px 20px" }}
        >
          Send
        </button>
      </div>
    </main>
  );
}
