
import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { getEmotion } from "../api/backend";
import "../App.css";
import { FaCamera, FaUpload, FaRedo, FaTimes } from "react-icons/fa";

const WebcamFeed = ({ setEmotion, setProcessing, setImage, savedImage}) => {
  const webcamRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const resetFeed = () => {
  setUploadedImage(null);
  setIsWebcamActive(false);

  if (setImage) setImage(null);

  localStorage.removeItem("detectedImage");
  localStorage.removeItem("detectedEmotion");

  setEmotion(null);
  sessionStorage.removeItem("freshLogin");
};


  const processImage = useCallback(async (imageSrc) => {
    setProcessing(true);
    const base64Data = imageSrc.includes(",") ? imageSrc.split(",")[1] : imageSrc;
    setUploadedImage(imageSrc);
    if (setImage) setImage(imageSrc);
    localStorage.setItem("detectedImage", imageSrc);
    try {
      const res = await getEmotion(base64Data);
      setEmotion(res.emotion);
      localStorage.setItem("detectedEmotion", res.emotion);
    } catch (err) {
      console.error("Error fetching emotion:", err);
      setEmotion("Error: Try Again");
    } finally {
      setProcessing(false);
    }
  }, [setEmotion, setProcessing, setImage]);

  const captureSnapshot = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsWebcamActive(false);
        processImage(imageSrc);
      }
    }
  }, [processImage]);

  const handleFileUpload = async (event) => {
    setIsWebcamActive(false);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => processImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleStartCamera = () => {
    if (uploadedImage) {
      setUploadedImage(null);
      setEmotion("---");
    }
    setIsWebcamActive(true);
  };

  return (
    <div className="webcam-feed">
      <div className="media-viewport">
        {isWebcamActive ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
            videoConstraints={{ facingMode: "user" }}
          />
        ) : uploadedImage ? (
          <img src={uploadedImage} alt="Captured or Uploaded" className="webcam" />
        ) : savedImage && !sessionStorage.getItem("freshLogin") ? (
          <img src={savedImage} alt="Saved Capture" className="webcam" />
        ) : (
          <div className="placeholder-box">
            <p>Upload a photo or start your camera to detect your mood.</p>
          </div>
        )}
      </div>

      <div className="action-buttons-group">
        <input
          type="file"
          accept="image/*"
          id="fileUpload"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          disabled={isWebcamActive}
        />

        {/* Upload Button */}
        <label htmlFor="fileUpload" className={`control-btn ${isWebcamActive ? "disabled" : ""}`} data-tip="Upload Photo">
          <FaUpload />
        </label>

        {/* Camera Controls */}
        {!isWebcamActive ? (
          <button className="control-btn" onClick={handleStartCamera} data-tip="Start Camera">
            <FaCamera />
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="control-btn" onClick={captureSnapshot} data-tip="Capture Snapshot">
              <FaCamera />
            </button>
            <button className="control-btn" onClick={resetFeed} data-tip="Cancel Camera">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Reset Button */}
        {uploadedImage && !isWebcamActive && (
          <button className="control-btn" onClick={resetFeed} data-tip="New Photo/Feed">
            <FaRedo />
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;
