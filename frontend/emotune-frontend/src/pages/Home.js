
import React, { useState, useEffect } from "react";
import "./Home.css";
import Header from "../components/Header";
import VibeTrackApp from "./VibeTrackApp";

function Home() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-theme" : "";
  }, [theme]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    setUser(currentUser);
  }, []);

  return (
    <div className={`home-container ${theme === "dark" ? "dark-theme" : ""}`}>
      <Header theme={theme} toggleTheme={toggleTheme} user={user} />

      <main className="content-area">
        <VibeTrackApp />
      </main>

      <footer className="footer">
        <p>© 2024 VibeTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;


