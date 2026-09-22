

import React, { useState, useEffect } from "react";
import { forgotPassword } from "../api/backend";
import "../pages/Home.css";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      if (!message) return;
  
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, messageType === "success" ? 3000 : 4000);
  
      return () => clearTimeout(timer);
    }, [message, messageType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    const res = await forgotPassword(email);
    setIsLoading(false);

    if (res.error) {
      setMessage(res.error);
      setMessageType("error");
    } else {
      setMessage(res.message);
      setMessageType("success");
    }
  };

  return (
    <div className="forgot-reset-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && (
            <p className={messageType === "success" ? "success-message" : "error-message"}>
              {message}
            </p>
          )}
          
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
        </form>

        <p className="back-to-login" onClick={() => navigate("/login")}>
          ← Back to Login
        </p>
      </div>
    </div>
    
  );
};

export default ForgotPasswordPage;
