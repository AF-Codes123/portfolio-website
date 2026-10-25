import { useState } from "react";

const services = [
  {
    title: "Full Stack Development",
    desc: "Fast, scalable web apps, from the frontend to the backend and database.",
    preview: "React, Node.js, MongoDB",
  },
  {
    title: "AI Engineering",
    desc: "Chatbots, AI agents and smart features that fit right into your product.",
    preview: "LLMs, RAG, AI agents",
  },
  {
    title: "AI Automation",
    desc: "Automate repetitive work and connect your tools into smooth workflows.",
    preview: "n8n, APIs, workflows",
  },
];

export default function Services() {
  const [active, setActive] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <section className="services" id="services">
      <div className="services-head">
        <h2>
          Solutions for
          <span className="typed"> your digital growth</span>
        </h2>
        <p className="sub">
          From idea to launch, I handle the whole process.
        </p>
      </div>

      <ul
        className="service-list"
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setActive(null)}
      >
        {services.map((s, i) => (
          <li
            key={s.title}
            className="service-item"
            onMouseEnter={() => setActive(i)}
          >
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <span className="arrow">↗</span>
          </li>
        ))}
      </ul>

      <div
        className={`preview ${active !== null ? "show" : ""}`}
        style={{ left: pos.x, top: pos.y }}
      >
        {active !== null && services[active].preview}
      </div>
    </section>
  );
}