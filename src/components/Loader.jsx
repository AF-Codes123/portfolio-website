import { useEffect, useRef, useState } from "react";

export default function Loader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const readyRef = useRef(document.readyState === "complete");

  useEffect(() => {
    document.body.style.overflow = "hidden"; // loader ke dauran scroll band

    const onLoad = () => (readyRef.current = true);
    window.addEventListener("load", onLoad);

    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / 1800, 1); // 1800 = 1.8 second
      const p = (1 - Math.pow(1 - t, 3)) * 100;
      // Jab tak page poora load na ho, 90% par ruk jao
      const shown = readyRef.current ? p : Math.min(p, 90);
      setProgress(shown);
      if (shown >= 100) {
        setLeaving(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = "";
    };
  }, []);

  // Fade out hone ke baad loader hata do
  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(onDone, 700);
    return () => clearTimeout(id);
  }, [leaving, onDone]);

  return (
    <div
      className={`loader ${leaving ? "leave" : ""}`}
      role="status"
      aria-label="Loading"
    >
      <div className="loader-center">
        <div className="loader-ring">
          <span>AF</span>
        </div>
        <p className="loader-name">Ayesha Fatima</p>
        <p className="loader-sub">Full Stack · AI Engineer</p>
        <div className="loader-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        <small className="loader-pct">{Math.round(progress)}%</small>
      </div>
    </div>
  );
}