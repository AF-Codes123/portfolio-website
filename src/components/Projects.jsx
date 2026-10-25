import { useRef, useState } from "react";

// Screenshots are in the public folder. File names must match exactly.
const projects = [
  {
    title: "Nawab's Table",
    type: "Full Stack",
    category: "fullstack",
    desc: "A full stack website for a restaurant, covering the menu, ordering and online presence. Deployed and live.",
    tags: ["React", "Node.js", "Database"],
    live: "https://nawabs-table.vercel.app",
    github: "https://github.com/AF-Codes123/nawabs-table",
    image: "/nawab.PNG",
  },
  {
    title: "Showroom Website",
    type: "Full Stack",
    category: "fullstack",
    desc: "A professional full stack website for a showroom that presents its products clearly and attractively.",
    tags: ["React", "Node.js", "Responsive"],
    live: "https://velocity-motors-three.vercel.app",
    github: "https://github.com/AF-Codes123/velocity-motors",
    image: "/showroom.PNG",
  },
  {
    title: "Job Scam Detector",
    type: "Machine Learning",
    category: "ai",
    desc: "An ML model that spots fake job postings so people can avoid scams, with an OCR feature that reads postings from images. Deployed and live.",
    tags: ["Python", "scikit-learn", "NLP", "OCR"],
    live: "https://job-scam-detector-with-ocr-feature-mpjfyd4uj5iukvlniotfts.streamlit.app/",
    github: "https://github.com/AF-Codes123/Job-Scam-Detector-With-OCR-Feature",
    image: "/scam.PNG",
  },
  {
    title: "AI Smart Study Chatbot",
    type: "AI + Web",
    category: "ai",
    desc: "A smart chatbot that helps students study, delivered as a deployed web app.",
    tags: ["Python", "LLM", "Web App"],
    live: "https://smart-ai-study-assistant.onrender.com",
    github: "https://github.com/AF-Codes123/smart-ai-study-assistant",
    image: "/study.PNG",
  },
];

const filters = [
  { key: "all", label: "All" },
  { key: "fullstack", label: "Full Stack" },
  { key: "ai", label: "AI & ML" },
];

// Browser-window preview with a gentle tilt on mouse move
function BrowserPreview({ project }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);

  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  const handleLeave = () => {
    ref.current.style.transform = "";
  };

  const address = project.live
    ? project.live.replace("https://", "").replace(/\/$/, "")
    : project.title;

  return (
    <div className="browser-wrap">
      <div
        ref={ref}
        className="browser"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="browser-bar">
          <i /> <i /> <i />
          <span>{address}</span>
        </div>
        <div className={`browser-screen ${project.category}`}>
          {project.image && !failed ? (
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              onError={() => setFailed(true)}
            />
          ) : (
            <span className="browser-letter">{project.title.charAt(0)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState("all");

  const shown =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="projects" id="projects">
      <div className="services-head">
        <h2>
          Recent
          <span className="typed"> projects</span>
        </h2>
        <p className="sub">
          From idea to launch, a few projects I have designed and built.
        </p>
      </div>

      <div className="filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="showcase">
        {shown.map((p, i) => (
          <article
            key={p.title}
            className={`showcase-row ${i % 2 ? "flip" : ""}`}
          >
            <BrowserPreview project={p} />

            <div className="showcase-info">
              <small className="project-type">{p.type}</small>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>

              <div className="tags">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>

              <div className="project-links">
                {p.live && (
                  <a href={p.live} target="_blank" rel="noreferrer">
                    Live site ↗
                  </a>
                )}
                {p.github && (
                  <a href={p.github} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filter !== "fullstack" && (
        <div className="more-banner">
          <div>
            <h3>Many more ML projects</h3>
            <p>
              My GitHub has plenty more machine learning and deep learning
              projects.
            </p>
          </div>
          <a
            href="https://github.com/AF-Codes123"
            target="_blank"
            rel="noreferrer"
            className="btn btn-work"
          >
            View on GitHub ↗
          </a>
        </div>
      )}
    </section>
  );
}