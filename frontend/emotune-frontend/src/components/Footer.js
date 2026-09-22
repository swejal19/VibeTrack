
import React from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import "../pages/Home.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand Section */}
        <div className="footer-section brand">
          <h2>VibeTrack</h2>
          <p>
            AI-powered emotion detection & music recommendation platform
            designed to match your mood.
          </p>
        </div>

        {/* Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>

        {/* Features */}
        <div className="footer-section">
          <h4>Features</h4>
          <ul>
            <li>Emotion Detection</li>
            <li>Smart Playlists</li>
            <li>Spotify Integration</li>
          </ul>
        </div>

        {/* Social */}
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-icons">
            <button
              type="button"
              className="social-btn"
              aria-label="GitHub"
            >
              <FaGithub />
            </button>

            <button
              type="button"
              className="social-btn"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </button>

            <button
              type="button"
              className="social-btn"
              aria-label="Instagram"
            >
              <FaInstagram />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        © 2025 VibeTrack. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

