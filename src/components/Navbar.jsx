import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Esc dabane par menu band
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <nav className={`nav ${open ? "open" : ""}`}>
      <a href="#home" className="logo" onClick={close}>
        <span>AF</span> Ayesha Fatima
      </a>

      <ul id="nav-links">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} onClick={close}>{l.label}</a>
          </li>
        ))}
      </ul>

      <a href="#contact" className="talk" onClick={close}>Let's talk</a>

      <button
        className="burger"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="nav-links"
      >
        <i /><i /><i />
      </button>
    </nav>
  );
}