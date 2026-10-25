import { useEffect, useRef, useState } from "react";
import axios from "axios";

// Locally this uses localhost. After deploy, set VITE_API_URL to your backend link.
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const GREETING =
  "Hi! I'm Ayesha's AI assistant. Ask me about her services and projects, or send her a message.";

const SUGGESTIONS = [
  "What services do you offer?",
  "Show me your projects",
  "I need a website",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/chat`, { messages: next });
      setMessages([...next, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      const text =
        err.response?.data?.error ||
        "Could not reach the server. Please try again in a moment.";
      setMessages([...next, { role: "assistant", content: text }]);
    } finally {
      setLoading(false);
    }
  };

  // Make links clickable
  const renderText = (text) =>
    text.split(/(https?:\/\/[^\s)]+)/g).map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noreferrer">{part}</a>
      ) : (
        part
      )
    );

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Ayesha's AI assistant">
          <div className="chat-head">
            <div className="chat-avatar">AF</div>
            <div>
              <strong>Ayesha's AI Assistant</strong>
              <small><i className="dot" /> Online</small>
            </div>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {renderText(m.content)}
              </div>
            ))}

            {loading && (
              <div className="bubble assistant typing"><i /><i /><i /></div>
            )}

            {messages.length === 1 && (
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              maxLength={500}
            />
            <button type="submit" disabled={loading || !input.trim()}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}