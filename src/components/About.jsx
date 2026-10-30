
import { useEffect, useRef, useState } from "react";

const CV_FILE = "/Ayesha-Fatima_CV.pdf";
const SHOW_CV = true;

const bio = [
  "I'm Ayesha Fatima, a Full Stack Developer and AI Engineer from Pakistan. I build clean web apps and smart AI systems that help businesses grow.",
  "My background is in data science: machine learning, deep learning and generative AI. I combine that with modern web development to ship products that are fast, useful and live on the web.",
];

const stats = [
  { value: "4", label: "Live projects" },
  { value: "3", label: "Core services" },
  { value: "Data Analysis to GenAI", label: "AI skill range" },
];

const skillGroups = [
  {
    title: "Full Stack",
    items: ["React", "Node.js", "Express", "REST APIs", "Databases"],
  },
  {
    title: "AI & Data Science",
    items: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Generative AI",
      "AI Agents",
    ],
  },
  {
    title: "Automation",
    items: ["AI Automation", "Workflows", "n8n"],
  },
];

// Fades in and slides up when scrolled into view
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function About() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <section className="about" id="about">
      <Reveal className="about-photo">
        <div className="about-glow" />

        {imgOk ? (
          <img
            src="/avatar.png"
            alt="Ayesha Fatima"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="about-initials">AF</div>
        )}
      </Reveal>

      <div className="about-body">
        <Reveal>
          <h2>
            About
            <span className="typed"> me</span>
          </h2>
        </Reveal>

        {bio.map((p, i) => (
          <Reveal key={i} delay={80 * (i + 1)}>
            <p className="about-text">{p}</p>
          </Reveal>
        ))}

        <Reveal delay={240}>
          <div className="stats">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="about-cta">
            {SHOW_CV && (
              <a
                className="btn btn-work"
                href={CV_FILE}
                download="Ayesha-Fatima_CV.pdf"
              >
                Download CV ↓
              </a>
            )}

            <a className="btn btn-project" href="#contact">
              Let's talk
            </a>
          </div>
        </Reveal>

        <div className="skill-groups">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={120 * i}>
              <div className="skill-card">
                <h3>{g.title}</h3>
                <div className="tags">
                  {g.items.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
