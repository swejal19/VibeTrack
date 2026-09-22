

import React from "react";
import "../App.css";


export const formatEmotion = (emotion) => {
  if (!emotion) return "";
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
};

const EMOTION_MAP = {
  angry: { emoji: "😡" },
  disgust: { emoji: "🤢" },
  fear: { emoji: "😨" },
  happy: { emoji: "😄" },
  neutral: { emoji: "😐" },
  sad: { emoji: "😢" },
  surprise: { emoji: "😲" },
};

const EmotionDisplay = ({ emotion, isProcessing }) => {
  if (!emotion) {
    return (
      <div className="emotion-card card-base">
        <h2>Current Vibe</h2>
        <div className="emotion-result">
          <span className="emoji">😶‍🌫️</span>
          <span className="emotion-text"></span>
        </div>
      </div>
    );
  }

  const { emoji } = EMOTION_MAP[emotion?.toLowerCase()] || {
    emoji: "😶‍🌫️",
  };

  return (
    <div className="emotion-card card-base">
      <h2>Current Vibe</h2>
      <div className="emotion-result">
        {isProcessing ? "Analyzing..." : (
          <>
            <span className="emoji">{emoji}</span>
            <span className="emotion-text">{formatEmotion(emotion)}</span>
          </>
        )}
      </div>
    </div>
  );
};


export default EmotionDisplay;


