
import React, { useEffect, useState } from 'react';
import "./Header.css";

import { FaUser, FaSignOutAlt, FaHome, FaSpotify } from 'react-icons/fa';
import { useNavigate, useLocation } from "react-router-dom";
import { getSpotifyProfile } from "../api/backend";

const API_BASE = process.env.REACT_APP_API_URL;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyInfo, setSpotifyInfo] = useState(null);

  const isLanding = path === "/";
  const isAuthPage = path === "/login" || path === "/signup";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/check-spotify`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(async (data) => {
        if (data.connected) {
          setSpotifyConnected(true);

          const info = await getSpotifyProfile();
          if (info?.connected) {
            setSpotifyInfo(info);
          }

          setTimeout(() => {
            const btn = document.querySelector(".spotify-badge");
            if (btn) btn.classList.add("pulse");
          }, 200);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.setItem("freshLogin", "1");
    navigate("/", { replace: true });
  };

  const handleSpotifyConnect = async () => {
    const oldToken = localStorage.getItem("token");
    if (!oldToken) return navigate("/login");

    let freshToken = oldToken;

    try {
      const res = await fetch(`${API_BASE}/api/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${oldToken}` }
      });

      const data = await res.json();
      if (data?.token) {
        freshToken = data.token;
        localStorage.setItem("token", freshToken);
      }
    } catch (e) {
      console.warn("Token refresh failed, using old token.");
    }

    const state = crypto.randomUUID();
    localStorage.setItem("spotify_state", state);

    window.location.href =
      `${API_BASE}/api/login/spotify?token=${freshToken}&state=${state}`;
  };

  return (
    <header className="modern-header">
      <div className="header-inner">
        <h2 className="logo" onClick={() => navigate('/')}>🎶 VibeTrack</h2>

        <nav className="nav-menu-modern">

          {/* -------- LANDING PAGE -------- */}
          {isLanding && (
            <>
              <button className="nav-btn login" onClick={() => navigate('/login')}>Login</button>
              <button className="nav-btn primary signup" onClick={() => navigate('/signup')}>Signup</button>
            </>
          )}

          {/* -------- Logged In Routes Except Profile -------- */}
          {!isLanding && !isAuthPage && path !== "/profile" && (
            <>
              <button className="nav-btn" onClick={() => navigate('/')}>
                <FaHome />  <span className="btn-text">Home</span>
              </button>

              <button className="nav-btn" onClick={() => navigate('/profile')}>
                <FaUser />  <span className="btn-text">Profile</span>
              </button>

              {!spotifyConnected ? (
                <button className="nav-btn" onClick={handleSpotifyConnect}>
                  <FaSpotify />  <span className="btn-text">Connect Spotify</span>
                </button>
              ) : (
                <button className="nav-btn spotify-badge" disabled>
                  <FaSpotify style={{ marginRight: 6 }} />

                  <span className="btn-text">
                    Linked as {spotifyInfo?.display_name || "Spotify User"}
                  </span>

                  {spotifyInfo?.image && (
                    <img
                      src={spotifyInfo.image}
                      className="spotify-avatar"
                      alt="spotify"
                    />
                  )}

                  <div className="spotify-bars">
                    <div className="spotify-bar"></div>
                    <div className="spotify-bar"></div>
                    <div className="spotify-bar"></div>
                  </div>
                </button>
              )}

              <button className="nav-btn danger" onClick={handleLogout}>
                <FaSignOutAlt />  <span className="btn-text">Logout</span>
              </button>
            </>
          )}

          {/* -------- PROFILE PAGE -------- */}
          {path === "/profile" && (
            <>
              <button className="nav-btn" onClick={() => navigate('/vibetrack')}>
                <FaHome /> Home
              </button>

              <button className="nav-btn danger" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
