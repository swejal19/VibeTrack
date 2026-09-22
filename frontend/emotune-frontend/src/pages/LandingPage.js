
import React, { useLayoutEffect, useRef, useEffect,useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMusic, FaCamera, FaHeadphones,
  FaBrain, FaChartLine, FaUserShield
} from "react-icons/fa";

import Header from "../components/Header";
import Footer from "../components/Footer";
import "./LandingPage.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { title: "Emotion Detection", text: "AI detects your emotion through webcam or photo to pick the perfect mood-matching music.", icon: <FaCamera /> },
  { title: "Curated Playlists", text: "Instant music recommendations tailored to your emotional state in real time.", icon: <FaMusic /> },
  { title: "Vibe Synchronization", text: "Shift moods smoothly with soothing or energetic music chosen by AI.", icon: <FaHeadphones /> },
  { title: "AI-Powered Insights", text: "Track emotional trends and understand how your mood evolves.", icon: <FaBrain /> },
  { title: "Emotion Analytics", text: "Analyze emotional patterns and see how music influences your mindset.", icon: <FaChartLine /> },
  { title: "Secure & Private", text: "Your face data is never stored—everything stays private and secure.", icon: <FaUserShield /> },
];

const LandingPage = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const sectionsRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const autoplayRef = useRef(null);

const stopAutoplay = useCallback(() => {
  if (autoplayRef.current) {
    clearInterval(autoplayRef.current);
    autoplayRef.current = null;
  }
}, []);

const startAutoplay = useCallback(() => {
  stopAutoplay();
  autoplayRef.current = setInterval(() => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  }, 1500);
}, [stopAutoplay]);

  useEffect(() => {
    startAutoplay();

    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const card = document.getElementById("musicCard");
    if (!card) return;

    const handleMove = (e) => {
      const x = (window.innerWidth / 2 - e.clientX) / 40;
      const y = (window.innerHeight / 2 - e.clientY) / 40;
      card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      const titleChars = gsap.utils.toArray(".hero-title .char");
      const subtitleChars = gsap.utils.toArray(".hero-subtitle .char");

      console.log("FOUND title chars:", titleChars.length);
      console.log("FOUND subtitle chars:", subtitleChars.length);

      if (titleChars.length === 0 || subtitleChars.length === 0) {
        gsap.set(".char", { opacity: 1 });
        return;
      }

      gsap.from(titleChars, {
        opacity: 0,
        y: 40,
        rotate: 8,
        duration: 1.4,
        ease: "power3.out",
        stagger: 0.03
      });

      gsap.from(subtitleChars, {
        opacity: 0,
        y: 25,
        rotate: 6,
        duration: 1.3,
        delay: 0.25,
        ease: "power3.out",
        stagger: 0.02
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 1.2,
        delay: 1,
        ease: "power3.out"
      });

      const glow = document.querySelector(".cursor-glow");

      window.addEventListener("mousemove", (e) => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });

      const dot = document.querySelector(".cursor-dot");

      window.addEventListener("mousemove", (e) => {
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });

      sectionsRef.current.forEach((sec) => {
        if (!sec) return;

        gsap.fromTo(
          sec,
          { opacity: 0, y: 50, filter: "blur(10px)" },
          {
            scrollTrigger: {
              trigger: sec,
              start: "top 85%",
              end: "top 40%",
              scrub: 0.4,
            },
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          }
        );
      });

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-wrapper">
      <div className="cursor-glow"></div>
      <div className="cursor-dot"></div>
      <Header />
      
      <section className="hero-centered">
        
        <div className="hero-grid">
          <div className="hero-grid1">
            <h1 className="hero-title split-text">
              {"AI That Listens to Your Mood".split("").map((char, index) => (
                <span key={index} className="char">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>

            <p className="hero-subtitle split-text">
              {"Detect your emotion instantly and get music that matches your vibe"
                .split("")
                .map((char, index) => (
                  <span key={index} className="char">
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
            </p>

            <div className="cta-wrapper">
              <button className="hero-cta" onClick={() => navigate("/login")}>
                Let's Start</button>
              <div className="emoji-1">😊
              </div>
              <div className="emoji-2">😡
              </div>
              <div className="emoji-3">😨
              </div>
              <div className="emoji-4">😲
              </div>
              <div className="emoji-5">🤢
              </div>
              <div className="emoji-6">😐
              </div>
            </div>
          </div>
          <div className="hero-grid2"><div className="music-glass-card" id="musicCard">
            <div className="music-icon">🎧</div>

            <h2 className="music-title">Calm Vibes</h2>
            <p className="music-subtitle">Soft beats for your mood</p>

            <div className="music-bar">
              <div className="progress"></div>
            </div>

            <div className="time-row">
              <span>1:12</span>
              <span>3:45</span>
            </div>
            <div className="controls">
              <button className="ctrl-btn">⏮</button>
              <button className="ctrl-btn play-btn">⏯</button>
              <button className="ctrl-btn">⏭</button>
            </div>
          </div>

          </div>
        </div>


      </section>
      <section
        className="features-grid-section"
        ref={(el) => (sectionsRef.current[0] = el)}
      >
        <h2 className="features-heading">Inside the VibeTrack Engine</h2>

        <div
          className="features-carousel"
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
          onTouchStart={stopAutoplay}
          onTouchEnd={startAutoplay}
        >
          {features.map((f, i) => {
            let position = "hidden";

            if (i === activeIndex) position = "center";
            else if (i === activeIndex - 1) position = "left";
            else if (i === activeIndex + 1) position = "right";

            return (
              <div key={i} className={`feature-card ${position}`} onMouseEnter={() => setActiveIndex(i)}>
                <div className="icon-box">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section
        className="curved-story-section"
        ref={(el) => (sectionsRef.current[3] = el)}
      >
        <div className="curved-content">
          <h2 className="curved-heading">A Fragmented Emotional Space</h2>

          <p className="curved-text">
            Music platforms rely on genres, clicks, and history.
            Human emotions don’t follow fixed categories.
            Feelings change constantly throughout the day.
            Playlists stay static and disconnected from mood.
            Users are forced to search instead of feeling understood.
            Emotional context is often lost in discovery.
            Our AI detects emotion in real time.
            It translates how you feel into music that fits.
          </p>
        </div>
      </section>

      <section
        className="flow-section"
        ref={(el) => (sectionsRef.current[2] = el)}
      >
        <h2 className="flow-heading">
          From Emotion to Music
        </h2>

        <div className="flow-steps">
          <div className="flow-card">
            <span className="flow-number">01</span>
            <h3>Detect Emotion</h3>
            <p>AI reads facial expressions through webcam or image.</p>
          </div>

          <div className="flow-line"></div>

          <div className="flow-card">
            <span className="flow-number">02</span>
            <h3>AI Analysis</h3>
            <p>Deep learning models understand your emotional state.</p>
          </div>

          <div className="flow-line"></div>

          <div className="flow-card">
            <span className="flow-number">03</span>
            <h3>Music Recommendation</h3>
            <p>AI instantly suggests songs that align perfectly with your mood.</p>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default LandingPage;
