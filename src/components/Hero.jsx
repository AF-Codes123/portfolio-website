import { useEffect, useRef, useState } from "react";
import TypingText from "./TypingText";

const words = [
  "Full Stack Apps.",
  "AI Systems.",
  "Smart Automations.",
];

// The avatar tries these files in order
const AVATAR_SOURCES = ["/avatar-scene.webp", "/avatar-scene.jpg"];

// If intro.mp3 is missing, this text is spoken by the browser voice
const INTRO_TEXT =
  "Hi, I'm Aisha Fatima. I'm a full stack developer and AI engineer. " +
  "I build web apps, AI agents and smart automations " +
  "that help businesses grow. Let's build something great together.";

export default function Hero() {
  const [playing, setPlaying] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const [srcIndex, setSrcIndex] = useState(0);
  const [hasVideo, setHasVideo] = useState(true); // is intro.mp4 available?

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(null);
  const tiltRef = useRef({ x: 0, y: 0, hover: false });

  // If an image fails to load, try the next one; if none work, show a message
  const handleImgError = () => {
    if (srcIndex < AVATAR_SOURCES.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      setImgOk(false);
    }
  };

  /* ---------- 3D tilt: idle sway + follows the mouse ---------- */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cur = { ry: 0, rx: 0 };
    const t0 = performance.now();
    let raf;

    const loop = (now) => {
      const t = (now - t0) / 1000;
      const { x, y, hover } = tiltRef.current;

      const targetRy = hover ? x * 24 : Math.sin(t * 0.7) * 12; // left-right
      const targetRx = hover ? -y * 12 : Math.sin(t * 0.5) * 2; // up-down

      cur.ry += (targetRy - cur.ry) * 0.07;
      cur.rx += (targetRx - cur.rx) * 0.07;

      const el = stageRef.current;
      if (el) {
        el.style.setProperty("--ry", `${cur.ry.toFixed(2)}deg`);
        el.style.setProperty("--rx", `${cur.rx.toFixed(2)}deg`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMove = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    tiltRef.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
      hover: true,
    };
  };
  const handleLeave = () => {
    tiltRef.current.hover = false;
  };

  /* ---------- Voice loudness meter ---------- */
  const stopMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    stageRef.current?.style.setProperty("--lvl", "0");
  };

  const startMeter = (audio) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      ctx.resume();

      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      const data = new Uint8Array(analyser.fftSize);
      let smooth = 0;

      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const x = (data[i] - 128) / 128;
          sum += x * x;
        }
        const rms = Math.sqrt(sum / data.length);
        const target = Math.min(1, rms * 4);
        smooth += (target - smooth) * 0.35;
        stageRef.current?.style.setProperty("--lvl", smooth.toFixed(3));
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      /* if the meter fails, the audio still plays */
    }
  };

  /* ---------- Stop ---------- */
  const stopIntro = () => {
    stopMeter();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };

  /* ---------- Backup 2: browser voice ---------- */
  const speakFallback = () => {
    if (!("speechSynthesis" in window)) {
      alert("Voice is not supported in this browser. Please use Chrome.");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(INTRO_TEXT);
    utter.lang = "en-US";
    utter.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang.startsWith("en") && /female|zira|samantha|google us/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (voice) utter.voice = voice;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  };

  /* ---------- Backup 1: intro.mp3, avatar reacts to the voice ---------- */
  const playAudioOnly = () => {
    const audio = new Audio("/intro.mp3");
    audioRef.current = audio;

    let fell = false;
    const fallback = () => {
      if (fell) return;
      fell = true;
      stopMeter();
      audioRef.current = null;
      speakFallback();
    };

    audio.onended = stopIntro;
    audio.onerror = fallback;
    audio
      .play()
      .then(() => {
        setPlaying(true);
        startMeter(audio);
      })
      .catch(fallback);
  };

  const startIntro = () => {
    stopIntro();

    // First try: the video (if intro.mp4 exists)
    if (hasVideo && videoRef.current) {
      const v = videoRef.current;
      v.currentTime = 0;
      v.play()
        .then(() => setPlaying(true))
        .catch(() => {
          setHasVideo(false);
          playAudioOnly();
        });
      return;
    }
    playAudioOnly();
  };

  const toggleIntro = () => (playing ? stopIntro() : startIntro());

  // Stop everything when leaving the page
  useEffect(() => stopIntro, []);

  return (
    <main className="hero" id="home">
      <div>
        <div className="status"><i className="dot" /> Available for new projects</div>

        <h1>
          I build
          <TypingText words={words} />
        </h1>

        <p className="sub">
          Full stack apps, AI systems and automations,
          built clean, fast and made to grow your business.
        </p>

        <div className="buttons">
          <button
            className={`btn btn-intro ${playing ? "playing" : ""}`}
            onClick={toggleIntro}
          >
            {playing ? "■ Stop intro" : "▶ Introduce"}
          </button>
          <a href="#projects" className="btn btn-work">See my work</a>
          <a href="#contact" className="btn btn-project">Start a project</a>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`avatar-stage ${playing ? "speaking" : ""} ${hasVideo ? "has-video" : ""}`}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="avatar-glow" />

        {imgOk ? (
          <div className="avatar-media">
            <img
              key={AVATAR_SOURCES[srcIndex]}
              className="avatar-img scene"
              src={AVATAR_SOURCES[srcIndex]}
              alt="Ayesha Fatima"
              onError={handleImgError}
            />
            {hasVideo && (
              <video
                ref={videoRef}
                className="avatar-video"
                src="/intro.mp4"
                preload="metadata"
                playsInline
                onEnded={stopIntro}
                onError={() => setHasVideo(false)}
              />
            )}
          </div>
        ) : (
          <div className="avatar-fallback">
            Put avatar-scene.webp (or .jpg) in the public folder
          </div>
        )}

        {playing && !hasVideo && (
          <div className="wave" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        )}
      </div>
    </main>
  );
}