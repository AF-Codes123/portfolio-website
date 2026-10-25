const year = new Date().getFullYear();

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const services = [
  "Full Stack Development",
  "AI Engineering",
  "AI Automation",
];

// Apne asli links yahan daalo
const socials = [
  { label: "GitHub", href: "https://github.com/AF-Codes123" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ayesha-fatima-80870b38b" },
  { label: "Email", href: "mailto:ayeshafatimaitcs360@gmail.com" },
];

export default function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="logo">
            <span>AF</span> Ayesha
          </div>
          <p>
            Full Stack Developer and AI Engineer. Main web apps, AI agents,
            automations  banati hoon jo business ko grow
            karein.
          </p>
          <a href="#contact" className="btn btn-work footer-cta">
            Start a project
          </a>
        </div>

        <nav className="footer-col" aria-label="Footer navigation">
          <h4>Navigate</h4>
          <ul>
            {navLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {services.map((s) => (
              <li key={s}>
                <a href="#services">{s}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Connect</h4>
          <ul>
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <small>
          © {year} Ayesha. All rights reserved. Built with React and
          Node.js.
        </small>
        <button className="to-top" onClick={toTop} aria-label="Back to top">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}