
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MusicSection from "../components/MusicSection";
import WebcamFeed from "../components/WebcamFeed";
import EmotionDisplay from "../components/EmotionDisplay";
import Header from "../components/Header";
import "./VibeTrack.css";

const VALID_EMOTIONS = [
    "angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"
  ];

function VibeTrackApp() {
  const [emotion, setEmotion] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!user || !token) {
    navigate("/login", { replace: true });
    return;
  }

  if (sessionStorage.getItem("freshLogin")) {
    setEmotion(null);
    setImage(null);

    localStorage.removeItem("detectedEmotion");
    localStorage.removeItem("detectedImage");

    sessionStorage.removeItem("freshLogin");
    return;
  }

  const savedEmotion = localStorage.getItem("detectedEmotion");
  if (VALID_EMOTIONS.includes(savedEmotion)) {
    setEmotion(savedEmotion);
  }

  const savedImage = localStorage.getItem("detectedImage");
  if (savedImage && savedImage !== "null") {
    setImage(savedImage);
  }
}, [navigate]);

  const handleRetry = () => {
    setError(null);
    setEmotion(null);
  };

  return (
    <div className="content-wrapper vibe-page vibe-track-page">
      <Header />

      <main className="vibe-container">

        <section className="vibe-hero">
          <h1 className="vibe-title">Vibe With Songs That Match Your Emotion</h1>
        </section>

        <section className="vibe-top">
          <div className="webcam-card vibe-card">
            <WebcamFeed
              savedImage={image}
              setEmotion={(emo) => {
                if (VALID_EMOTIONS.includes(emo)) {
                  setEmotion(emo);
                  localStorage.setItem("detectedEmotion", emo);
                } else {
                  setEmotion(null);
                  localStorage.removeItem("detectedEmotion");
                }
              }}
              setImage={(img) => {
                setImage(img);
                localStorage.setItem("detectedImage", img);
              }}
              setProcessing={setIsProcessing}
              setError={setError}
            />
          </div>
        </section>

        <section className="vibe-bottom">

          <div className="vibe-left vibe-card-left vibe-card">
            <EmotionDisplay
              emotion={emotion}
              isProcessing={isProcessing}
              image={image}
            />
          </div>

          <div className="vibe-right vibe-card-right vibe-card">
            {emotion ? (
              <MusicSection emotion={emotion} />
            ) : (
              <p className="no-emotion-text">
                🎧 Detect your emotion to get recommendations
              </p>
            )}
          </div>

        </section>

        {error && (
          <div className="error-banner vibe-error">
            <p>{error}</p>
            <button onClick={handleRetry}>Try Again</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default VibeTrackApp;
