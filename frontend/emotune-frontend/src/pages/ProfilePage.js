
import React, { useState, useEffect } from "react";
import "../pages/Profile.css";
import { formatEmotion } from "../components/EmotionDisplay";
import {
  getProfile,
  updatePassword,
  getMoodHistory,
  getMoodAnalytics,
  getMoodSummary,
  API_AUTH_URL,
} from "../api/backend";
import { useNavigate } from "react-router-dom";
import MoodCharts from "../components/MoodCharts";

const API_BASE = process.env.REACT_APP_API_URL;

function ProfilePage() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [spotifyInfo, setSpotifyInfo] = useState(null); 
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [likedSongs, setLikedSongs] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    timeline: [],
    distribution: {},
  });
  const [summaryData, setSummaryData] = useState({
    streak: 0,
    dominant_mood: "",
    summary: "",
  });

  const moodEmojiMap = {
    angry: "😡",
    disgust: "🤢",
    fear: "😨",
    happy: "😄",
    neutral: "😐",
    sad: "😢",
    surprise: "😲",
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, messageType === "success" ? 3000 : 4000);

    return () => clearTimeout(timer);
  }, [message, messageType]);

  const compressImage = (file, maxWidth = 800) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          }, "image/jpeg", 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!token || !storedUser) return;

    const fetchUser = async () => {
      try {
        const data = await getProfile(token);

        if (data.profile_photo && !data.profile_photo.startsWith("http")) {
          const backendUrl =
            process.env.REACT_APP_API_URL;
          data.profile_photo = `${backendUrl}${data.profile_photo}`;
        }

        setUser(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      }
    };

    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/liked-songs`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setLikedSongs(data.liked_songs || []);
      } catch (error) {
        console.error("Fetch Liked Songs Error:", error);
      }
    };

    const loadMoodHistory = async () => {
      const data = await getMoodHistory();
      setMoodHistory(data.history || []);
    };

    const loadAnalytics = async () => {
      const data = await getMoodAnalytics();
      setAnalyticsData(data);
    };

    const loadSummary = async () => {
      const data = await getMoodSummary();
      setSummaryData(data);
    };

    const fetchSpotifyInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/spotify/me`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setSpotifyInfo(null);
          return;
        }

        const data = await res.json();

        if (data.connected) {
          setSpotifyInfo({
            image: data.image,
            name: data.display_name,
          });
        } else {
          setSpotifyInfo(null);
        }
      } catch (err) {
        setSpotifyInfo(null);
        console.warn("Spotify info fetch failed:", err);
      }
    };

    fetchUser();
    fetchLikedSongs();
    loadMoodHistory();
    loadAnalytics();
    loadSummary();
    fetchSpotifyInfo(); 
  }, [navigate]);

  const handleRemoveSong = async (songId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE}/api/liked-songs/${songId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLikedSongs((prev) => prev.filter((s) => s.song_id !== songId));
    } catch (err) {
      console.error("Remove error:", err);
      alert("Failed to remove song");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const uploadPhotoInstant = async (compressedFile) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("profile_photo", compressedFile);

    try {
      const res = await fetch(`${API_AUTH_URL}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      const backendUrl = process.env.REACT_APP_API_URL;
      const fullImageUrl = backendUrl + data.profile_photo;

      setPreviewImage(fullImageUrl);
      setUser((prev) => ({ ...prev, profile_photo: fullImageUrl }));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, profile_photo: fullImageUrl })
      );

      setMessage("Profile photo updated!");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setMessage("Please upload a valid image (JPEG, PNG, WebP)");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be below 5MB");
      setMessageType("error");
      return;
    }

    const compressed = await compressImage(file);

    setPreviewImage(URL.createObjectURL(compressed));
    uploadPhotoInstant(compressed);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Session expired. Please login again.");
      setMessageType("error");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setMessage("Updating profile...");
    setMessageType("success");

    try {
      const formData = new FormData();
      formData.append("name", user.name.trim());

      if (profileImage) {
        formData.append("profile_photo", profileImage);
      }

      const res = await fetch(`${API_AUTH_URL}/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Profile updated successfully!");
      setMessageType("success");

      if (data.profile_photo) {
        const backendUrl =
          process.env.REACT_APP_API_URL;
        const fullImageUrl = backendUrl + data.profile_photo;

        setPreviewImage(fullImageUrl);
        setUser((prev) => ({ ...prev, profile_photo: fullImageUrl }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, profile_photo: fullImageUrl })
        );
      }

      setProfileImage(null);
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage(err.message || "Failed to update profile.");
      setMessageType("error");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      setMessage("Please fill both password fields.");
      setMessageType("error");
      return;
    }

    try {
      const res = await updatePassword(oldPassword, newPassword);

      if (res.error) {
        setMessage(res.error);
        setMessageType("error");
      } else {
        setMessage("Password updated successfully!");
        setMessageType("success");
      }

    } catch (err) {
      console.error(err);
      setMessage("Failed to update password.");
      setMessageType("error");
    }
  };


  return (
    <div className="gs-profile-page">
      {/* TOP BAR */}
      <header className="gs-topbar">
        <h2>My Profile</h2>
        <button
          className="gs-logout"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </header>

      {/* MAIN GRID */}
      <div className="gs-grid">
        {/* LEFT PROFILE CARD */}
        <div className="gs-card gs-profile-card">
          <img
            src={previewImage || user.profile_photo || "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(user.name || "User") +
              "&background=7b5cff&color=fff"}
            className="gs-avatar"
            alt="Profile"
          />

          <label className="gs-change-photo">
            Edit
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>

          <h3 className="gs-username">{user.name}</h3>
          <p className="gs-user-email">{user.email}</p>

          {/* Spotify Profile */}
          {spotifyInfo && (
            <div className="spotify-profile-box">
              <img
                src={
                  spotifyInfo.image
                    ? spotifyInfo.image
                    : "/default-spotify.png"   
                }
                alt="Spotify Avatar"
                className="spotify-avatar"
              />
              <p className="spotify-name">{spotifyInfo.name}</p>
              <button
                className="spotify-disconnect-btn"
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  await fetch(`${API_BASE}/api/spotify/disconnect`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  setSpotifyInfo(null);
                  setMessage("Spotify disconnected");
                  setMessageType("success");
                }}
              >
                Disconnect Spotify
              </button>
            </div>
          )}


          <div className="gs-stats">
            <div>
              <div className="gs-stat-number">{summaryData.streak}</div>
              <div className="gs-stat-label">Streak</div>
            </div>
            <div>
              <div className="gs-stat-number">{formatEmotion(summaryData.dominant_mood)}</div>
              <div className="gs-stat-label">Mood</div>
            </div>
          </div>
        </div>

        <div className="gs-column">
          {/* UPDATE INFO */}
          <div className="gs-card gs-form-card">
            <h3>Update Info</h3>
            <form className="gs-form" onSubmit={handleSave}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
              />

              <label>Email</label>
              <input type="email" value={user.email} readOnly />

              <button className="gs-btn-primary">Save</button>
            </form>
          </div>

          {/* UPDATE PASSWORD */}
          <div className="gs-card gs-form-card">
            <h3>Change Password</h3>
            <form className="gs-form" onSubmit={handlePasswordChange}>
              <label>Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />

              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button className="gs-btn-outline">Update</button>
            </form>
          </div>
        </div>

        {/* LIKED SONGS */}
        <div className="gs-card gs-wide-card">
          <h3>❤️ Liked Songs</h3>

          {likedSongs.length === 0 ? (
            <p className="gs-muted">You haven't liked any songs yet.</p>
          ) : (
            <div className="gs-liked-grid">
              {likedSongs.map((s, index) => (
                <div key={index} className="gs-song-card">
                  <div>
                    <div className="gs-track-name">{s.song_name}</div>
                    <div className="gs-track-date">
                      Liked on {s.liked_at}
                    </div>
                  </div>
                  <button
                    className="gs-remove"
                    data-tip="Remove"
                    onClick={() => handleRemoveSong(s.song_id)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MOOD HISTORY + SUMMARY */}
        <div className="gs-column gs-two-col">
          {/* Mood History */}
          <div className="gs-card">
            <h3>🧠 Mood History</h3>

            {moodHistory.length === 0 ? (
              <p className="gs-muted">No mood history yet.</p>
            ) : (
              <ul className="gs-timeline">
                {moodHistory.map((m, i) => (
                  <li key={i} className="gs-timeline-item">
                    <div className="gs-dot" />
                    <div>
                      <div className="gs-mood">{moodEmojiMap[m.mood]} {formatEmotion(m.mood)}</div>
                      <div className="gs-date">
                        {new Date(m.detected_at).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Summary */}
          <div className="gs-card s-card">
            <h3>🔮 Summary</h3>
            <p>
              <b>Streak 🔥:</b> {summaryData.streak}
            </p>
            <p>
              <b>Dominant Mood:</b> {formatEmotion(summaryData.dominant_mood)}
            </p>
            <p>
              <b>AI Summary:</b> {summaryData.summary}
            </p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="gs-card gs-charts">
          <h2 className="charts-h2">Weekly Analytics</h2>
          <MoodCharts analyticsData={analyticsData} />
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div
          className={`gs-toast ${
            messageType === "success" ? "gs-success" : "gs-error"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
