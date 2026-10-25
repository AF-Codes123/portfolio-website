import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  // Wake the backend as soon as the site opens (free plan servers sleep)
  useEffect(() => {
    fetch(`${API}/api/health`).catch(() => {});
  }, []);

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Projects />
      <Contact />
      <Footer />
      <ChatWidget />
    </>
  );
}