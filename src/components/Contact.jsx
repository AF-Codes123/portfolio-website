import { useRef, useState } from "react";
import axios from "axios";

// Locally this uses localhost. After deploy, set VITE_API_URL to your backend link.
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [burst, setBurst] = useState([]);

  const formRef = useRef(null);
  const btnRef = useRef(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Spotlight follows the mouse
  const handleSpotlight = (e) => {
    const r = formRef.current.getBoundingClientRect();
    formRef.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    formRef.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  // Magnetic button
  const handleMagnet = (e) => {
    const r = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
    btnRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const resetMagnet = () => {
    btnRef.current.style.transform = "";
  };

  // Confetti
  const launchConfetti = () => {
    const pieces = Array.from({ length: 28 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 110;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        color: i % 3,
      };
    });
    setBurst(pieces);
    setTimeout(() => setBurst([]), 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await axios.post(`${API}/api/contact`, form);
      setStatus({ type: "success", text: res.data.message });
      setForm({ name: "", email: "", message: "" });
      launchConfetti();
    } catch (err) {
      const text =
        err.response?.data?.error ||
        "Could not reach the server. Please try again in a moment.";
      setStatus({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-text">
        <h2>
          Let's build
          <span className="typed"> something great</span>
        </h2>
        <p className="sub">
          Tell me about your idea: a website, an AI agent or an automation.
          Fill in the form, or chat with my AI assistant. I'll get back to
          you soon.
        </p>
      </div>

      <form
        ref={formRef}
        className="contact-form"
        onSubmit={handleSubmit}
        onMouseMove={handleSpotlight}
      >
        <input
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          rows="5"
          placeholder="Tell me about your project"
          value={form.message}
          onChange={handleChange}
          required
        />

        <div className="send-wrap">
          <button
            ref={btnRef}
            className="btn btn-work"
            type="submit"
            disabled={loading}
            onMouseMove={handleMagnet}
            onMouseLeave={resetMagnet}
          >
            {loading ? "Sending..." : "Send message"}
          </button>

          {burst.map((p) => (
            <span
              key={p.id}
              className={`confetti c${p.color}`}
              style={{ "--x": `${p.x}px`, "--y": `${p.y}px` }}
            />
          ))}
        </div>

        {status.text && (
          <p className={`form-status ${status.type}`}>{status.text}</p>
        )}
      </form>
    </section>
  );
}