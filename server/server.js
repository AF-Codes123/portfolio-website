require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL || "gemini-2.5-flash";

// Behind Render's proxy, this lets us see each visitor's real IP
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));

/* ---------- Email notification (Resend) ---------- */
async function notifyEmail({ name, email, message, source }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;

  const text =
    `New message from your portfolio (${source})\n\n` +
    `Name: ${String(name).slice(0, 100)}\n` +
    `Email: ${String(email).slice(0, 150)}\n\n` +
    `${String(message).slice(0, 1500)}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: String(email).slice(0, 150),
        subject: `New message from ${String(name).slice(0, 60)}`,
        text,
      }),
    });
    if (!res.ok) console.error("Email error:", res.status, await res.text());
  } catch (err) {
    console.error("Email error:", err.message);
  }
}

/* ---------- Messages save karna ---------- */
const DATA_DIR = path.join(__dirname, "data");
const FILE = path.join(DATA_DIR, "messages.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");

function saveMessage({ name, email, message, source }) {
  const messages = JSON.parse(fs.readFileSync(FILE, "utf8"));
  messages.push({
    id: Date.now(),
    name: String(name).slice(0, 100),
    email: String(email).slice(0, 150),
    message: String(message).slice(0, 2000),
    source,
    date: new Date().toISOString(),
  });
  fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));
  notifyEmail({ name, email, message, source });
}

/* ---------- Agent ka data ---------- */
const SERVICES = [
  { name: "Full Stack Development", detail: "Web apps frontend se backend aur database tak (React, Node.js)." },
  { name: "AI Engineering", detail: "ML, deep learning, chatbots aur AI agents." },
  { name: "AI Automation", detail: "Workflows aur repeat kaam automate karna." },
  
];

const PROJECTS = [
  { name: "Nawab's Table", type: "Full Stack", about: "Restaurant website", live: "https://nawabs-table.vercel.app", github: "https://github.com/AF-Codes123/nawabs-table" },
  { name: "Showroom Website", type: "Full Stack", about: "Velocity Motors showroom website", live: "https://velocity-motors-three.vercel.app", github: "https://github.com/AF-Codes123/velocity-motors" },
  { name: "Job Scam Detector", type: "Machine Learning", about: "Fake job postings pehchanta hai, OCR feature ke saath", live: "https://job-scam-detector-with-ocr-feature-mpjfyd4uj5iukvlniotfts.streamlit.app/", github: "https://github.com/AF-Codes123/Job-Scam-Detector-With-OCR-Feature" },
  { name: "AI Smart Study Chatbot", type: "AI + Web", about: "Students ke liye study assistant", live: "https://smart-ai-study-assistant.onrender.com", github: "https://github.com/AF-Codes123/smart-ai-study-assistant" },
];

const SYSTEM = `You are the AI assistant on Ayesha Fatima's portfolio website.
Ayesha is a Full Stack Developer, AI Engineer, AI Automation specialist that ghelpsthe businesses to grow.


Rules:
- Reply in the same language the visitor uses (English, Urdu or Roman Urdu).
- Keep answers short, friendly and professional.
- Use the tools to get real services and projects. Never invent services, projects, prices or links.
- If a visitor wants to hire Ayesha or send a message, ask for their name, email and what they need. Only call send_message_to_ayesha once you have all three.
- If you don't know something (like pricing), say Ayesha will answer personally and offer to pass on a message.`;

/* ---------- Tools (agent ke haath) ---------- */
const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "get_services",
        description: "Get the list of services Ayesha offers.",
      },
      {
        name: "get_projects",
        description: "Get Ayesha's projects with live and GitHub links.",
      },
      {
        name: "send_message_to_ayesha",
        description:
          "Send a visitor's message to Ayesha. Needs the visitor's name, email and message.",
        parameters: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Visitor's name" },
            email: { type: "STRING", description: "Visitor's email" },
            message: { type: "STRING", description: "What the visitor needs" },
          },
          required: ["name", "email", "message"],
        },
      },
    ],
  },
];

function runTool(name, args) {
  if (name === "get_services") return { services: SERVICES };
  if (name === "get_projects") return { projects: PROJECTS };
  if (name === "send_message_to_ayesha") {
    const { name: n, email, message } = args || {};
    if (!n || !email || !message || !/^\S+@\S+\.\S+$/.test(email))
      return { ok: false, error: "Valid name, email and message are required." };
    saveMessage({ name: n, email, message, source: "ai-agent" });
    return { ok: true };
  }
  return { error: "Unknown tool" };
}

/* ---------- Agent loop ---------- */
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

async function runAgent(history) {
  // Gemini mein "assistant" ko "model" kehte hain
  const contents = history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  for (let step = 0; step < 5; step++) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction: SYSTEM, tools: TOOLS },
    });

    const calls = response.functionCalls;

    // Tool nahi chahiye: seedha jawab do
    if (!calls || calls.length === 0) {
      return response.text || "Sorry, main jawab nahi de paya. Dobara try karein.";
    }

    // Agent ne tool maanga: chalao aur result wapas do
    contents.push(response.candidates[0].content);
    contents.push({
      role: "user",
      parts: calls.map((c) => ({
        functionResponse: {
          name: c.name,
          response: { result: runTool(c.name, c.args) },
        },
      })),
    });
  }
  return "Sorry, kuch masla aa gaya. Dobara try karein.";
}

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { ok: false, error: "Too many messages. Please try again later." },
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  if (!ai)
    return res.status(500).json({ ok: false, error: "AI agent abhi set up nahi hai (API key missing)." });

  const raw = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const history = raw
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user")
    return res.status(400).json({ ok: false, error: "Message required." });

  try {
    const reply = await runAgent(history);
    res.json({ ok: true, reply });
  } catch (err) {
    console.error("Agent error:", err.status || "", err.message);
    const busy = err.status === 429;
    res.status(busy ? 429 : 500).json({
      ok: false,
      error: busy
        ? "AI assistant ki free limit abhi poori ho gayi hai. Thori der baad try karein, ya Contact form use karein."
        : "AI assistant abhi jawab nahi de paya. Thori der baad try karein.",
    });
  }
});

/* ---------- Health check ---------- */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "Ayesha Fatima API", agent: Boolean(ai) });
});

/* ---------- Contact form ---------- */
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { ok: false, error: "Too many messages. Please try again later." },
});

app.post("/api/contact", contactLimiter, (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message)
    return res.status(400).json({ ok: false, error: "All fields are required." });
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ ok: false, error: "Enter a valid email." });
  if (message.length > 2000)
    return res.status(400).json({ ok: false, error: "Message is too long." });

  saveMessage({ name, email, message, source: "contact-form" });
  res.json({ ok: true, message: "Thanks! I'll get back to you soon." });
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});