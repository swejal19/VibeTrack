
import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = process.env.REACT_APP_API_URL;

export const API_AUTH_URL = `${API_URL}/api/auth`;
const API_EMOTION_URL = `${API_URL}/api`;
const API_BASE = `${API_URL}/api`;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const oldToken = localStorage.getItem("token");
      if (!oldToken) return Promise.reject(error);

      try {
        const refreshRes = await fetch(`${API_AUTH_URL}/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: { Authorization: `Bearer ${oldToken}` },
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newToken = data.token;

          localStorage.setItem("token", newToken);

          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
      } catch (err) {
        console.error("JWT Refresh Failed:", err);
      }
    }

    return Promise.reject(error);
  }
);


/* ------------------- AUTH APIs ------------------- */

// Signup user
export const signupUser = async (name, email, password) => {
  try {
    const res = await fetch(`${API_AUTH_URL}/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return await res.json();
  } catch (error) {
    console.error("Signup Error:", error);
    return { error: "Server error" };
  }
};

// Login user and store token
export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_AUTH_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    return { error: "Server error" };
  }
};

/* ------------------- PROFILE APIs ------------------- */

// Get user profile
export const getProfile = async (token) => {
  try {
    const res = await fetch(`${API_AUTH_URL}/profile`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  } catch (error) {
    console.error("GetProfile Error:", error);
    throw error;
  }
};

export const updateProfile = async (token, formData) => {
  try {
    const res = await fetch(`${API_AUTH_URL}/profile`, {
      method: "PUT",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      body: formData,
    });

    return await res.json();
  } catch (error) {
    console.error("UpdateProfile Error:", error);
    throw error;
  }
};


export const updatePassword = async (old_password, new_password) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_AUTH_URL}/change-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ old_password, new_password }),
    });

    return await res.json();
  } catch (error) {
    return { error: "Server error" };
  }
};


/* ------------------- EMOTION API ------------------- */

export const getEmotion = async (base64Image) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_EMOTION_URL}/detect-emotion`,
      { image: base64Image },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("GetEmotion API Error:", error);
    return { error: "Detection failed" };
  }
};

/* ------------------- FORGOT/RESET PASSWORD ------------------- */

// Send forgot password email
export const forgotPassword = async (email) => {
  try {
    const res = await fetch(`${API_AUTH_URL}/forgot-password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (error) {
    console.error("ForgotPassword Error:", error);
    return { error: "Server error" };
  }
};

// Reset password using token
export const resetPassword = async (email, token, new_password) => {
  try {
    const res = await fetch(`${API_AUTH_URL}/reset-password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, new_password }),
    });
    return await res.json();
  } catch (error) {
    console.error("ResetPassword Error:", error);
    return { error: "Server error" };
  }
};

/* ------------------- Emotion Dashboard ------------------- */

// Mood History
export const getMoodHistory = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_EMOTION_URL}/mood/history`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

// Weekly Analytics
export const getMoodAnalytics = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_EMOTION_URL}/mood/analytics`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

// Mood Streak + Summary
export const getMoodSummary = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_EMOTION_URL}/mood/summary`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

/* ------------------- SPOTIFY OAUTH ------------------- */

export const connectSpotify = async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) return { error: "Not logged in" };

  const state = crypto.randomUUID();
  localStorage.setItem("spotify_state", state);

  const url = `${API_BASE}/login/spotify?token=${token}&state=${state}`;

  return url;
};

export const getSpotifyProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API_BASE}/spotify/me`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` }
  });

  return await res.json();
};