

import React, { useState, useEffect } from "react";
import { resetPassword } from "../api/backend";
import "../pages/Home.css";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPasswordPage = ({ email: initialEmail, token: initialToken }) => {
  const [email, setEmail] = useState(initialEmail || "");
  const [token, setToken] = useState(initialToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, messageType === "success" ? 3000 : 4000);

    return () => clearTimeout(timer);
  }, [message, messageType]);

  useEffect(() => {
    if (!email || !token) {
      const params = new URLSearchParams(location.search);
      const urlEmail = params.get("email");
      const urlToken = params.get("token");
      if (urlEmail && urlToken) {
        setEmail(urlEmail);
        setToken(urlToken);
      } else {
        navigate("/forgot-password");
      }
    }
  }, [email, token, location, navigate]);


  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const getStrengthClass = (pass) => {
    if (pass.length < 6) return "weak";
    if (pass.length < 10 && /[A-Z]/.test(pass)) return "medium";
    if (pass.length >= 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return "strong";
    return "weak";
  };

  const getStrengthText = (pass) => {
    const strength = getStrengthClass(pass);
    return strength.charAt(0).toUpperCase() + strength.slice(1);
  };

  const checkPasswordStrength = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pass)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(pass)) return "Password must contain a number";
    return null;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const strengthError = checkPasswordStrength(newPassword);
    if (strengthError) {
      setMessage(strengthError);
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(email, token, newPassword);
    setIsLoading(false);

    if (res.error) {
      setMessage(res.error);
      setMessageType("error");
    } else {
      setMessage(res.message);
      setMessageType("success");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="forgot-reset-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p>Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {newPassword && (
              <p className={`password-strength ${getStrengthClass(newPassword)}`}>
                Strength: {getStrengthText(newPassword)}
              </p>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className={messageType === "success" ? "success-message" : "error-message"}>
              {message}
            </p>
          )}

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>


        <p className="back-to-login" onClick={() => navigate("/login")}>
          ← Back to Login
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
