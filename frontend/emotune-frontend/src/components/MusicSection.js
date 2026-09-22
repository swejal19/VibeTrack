
import React, { useEffect, useState, useCallback } from "react";
import "../App.css";
import { formatEmotion } from "../components/EmotionDisplay";
import { FaForward, FaBackward, FaRedo } from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL;
const SONGS_PER_PAGE = 3;

const MusicSection = ({ emotion }) => {
  const [songs, setSongs] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [language, setLanguage] = useState("all");
  const [loading, setLoading] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/check-spotify`, {
      method: "GET",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setSpotifyConnected(Boolean(data.connected)))
      .catch(() => setSpotifyConnected(false));
  }, []);

  const loadingRef = React.useRef(false);

  const fetchSongs = useCallback(async () => {
  if (!emotion || !spotifyConnected) return;
  if (loadingRef.current) return;

  loadingRef.current = true;
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/recommendations?emotion=${emotion}&language=${language}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    console.log("🎵 Recommendations response:", data);

    const tracks =
      data.tracks ||
      data.songs ||
      data.recommendations ||
      (Array.isArray(data) ? data : []);

    if (Array.isArray(tracks) && tracks.length > 0) {
      setSongs([...tracks].sort(() => Math.random() - 0.5));
      setStartIndex(0);
    } else {
      setSongs([]);
    }

  } catch (err) {
    console.error("Error fetching songs:", err);
    setSongs([]);
  } finally {
    loadingRef.current = false;
    setLoading(false);
  }
}, [emotion, language, spotifyConnected]);


  useEffect(() => {
    if (!emotion || emotion === "---" || emotion === "Error: Try Again") {
      setSongs([]);
      return;
    }
    fetchSongs();
  }, [emotion, language, fetchSongs]);

  const handleNext = () => {
    setStartIndex((prev) => (prev + SONGS_PER_PAGE) % songs.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - SONGS_PER_PAGE + songs.length) % songs.length);
  };

  const handleRefresh = () => {
    if (loading) return;
    fetchSongs();
  };

  const triggerHeartBurst = (songId) => {
    setLikeAnimation(songId);
    setTimeout(() => setLikeAnimation(null), 800);
  };

  const handleLike = async (song) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        alert("Please login to like songs");
        return;
      }

      await fetch(`${API_BASE}/api/like-song`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          song_id: song.id,
          song_name: song.name,
        }),
      });

      triggerHeartBurst(song.id);
    } catch (error) {
      console.error("Like Error:", error);
    }
  };

  const displayedSongs = songs.slice(startIndex, startIndex + SONGS_PER_PAGE);

  return (
    <div className="music-card card-base music-glass">
      <h2 className="fade-in-title">🎵 Music Recommendations</h2>
      {/* STATUS MESSAGE */}
      {!spotifyConnected ? (
        <p className="emotion-text">
          🔗 Connect Spotify to get song recommendations
        </p>
      ) : emotion ? (
        <p className="emotion-text fade-in-small">
          Matching your vibe: <strong>{formatEmotion(emotion)}</strong>
        </p>
      ) : (
        <p className="emotion-text">🎧 Detect an emotion to begin</p>
      )}

      <div className="language-select-wrapper fade-in-small">
        <label htmlFor="language">🌐 Select Language:</label>
        <select
          id="language"
          className="language-select glow-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="all">All</option>
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="punjabi">Punjabi</option>
          <option value="spanish">Spanish</option>
          <option value="tamil">Tamil</option>
          <option value="korean">Korean</option>
        </select>
      </div>

      {/* LOADING MUSIC BARS */}
      {loading && (
        <div className="loading-bars">
          <div></div><div></div><div></div>
        </div>
      )}

      {/* SONGS */}
      {!loading && displayedSongs.length > 0 ? (
        <>
          <div className="spotify-embeds fade-in">
            {displayedSongs.map((song) => (
              <div key={song.id} className="song-wrapper slide-in">

                <div className="song-card">
                  <img
                    src={song.image || "/default-album.png"}
                    alt={song.name}
                    className="song-cover"
                  />

                  <div className="song-info">
                    <h4 className="song-title">{song.name}</h4>
                    <p className="song-artist">
                      {song.artist || "Spotify Track"}
                    </p>
                  </div>

                  <div className="song-actions">
                    <button
                      className="spotify-open-btn"
                      onClick={() =>
                        window.open(
                          `https://open.spotify.com/track/${song.id}`,
                          "_blank"
                        )
                      }
                    >
                      🎧 Open in Spotify
                    </button>

                    <button
                      className={`like-btn ${likeAnimation === song.id ? "heart-burst" : ""
                        }`}
                      onClick={() => handleLike(song)}
                    >
                      ❤️
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* CONTROLS */}
          <div className="music-controls fade-in-small">
            <button className="control-btn" onClick={handlePrev}>
              <FaBackward />
            </button>
            <button className="control-btn" onClick={handleNext}>
              <FaForward />
            </button>
            <button className="control-btn" onClick={handleRefresh}>
              <FaRedo />
            </button>
          </div>
        </>
      ) : (
        !loading &&
        spotifyConnected &&
        emotion && <p style={{ color: "#777" }}>No songs found.</p>
      )}
    </div>
  );
};

export default MusicSection;
