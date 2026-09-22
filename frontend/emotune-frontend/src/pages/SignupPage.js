
import React, { useState, useLayoutEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./Auth.css";
import gsap from "gsap";

import { signupUser } from "../api/backend"; 

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
    setMessageType("");
  }, 3000);

  return () => clearTimeout(timer);
}, [message]);

  const navigate = useNavigate();

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
    setMessage("");

    if (name.trim().length < 2) {
      setMessage("Name must be at least 2 characters");
      setMessageType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email");
      setMessageType("error");
      return;
    }

    const passwordError = checkPasswordStrength(password);
    if (passwordError) {
      setMessage(passwordError);
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await signupUser(name, email, password);

      if (response.error) {
        setMessage(response.error);
        setMessageType("error");
      } else {
        setMessage("Signup successful! Redirecting to login...");
        setMessageType("success");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setMessage("Network error. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      gsap.set(".auth-page .auth-card, .auth-page .auth-bg-blob", {
        opacity: 1,
        clearProps: "all"
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".auth-page .auth-bg-blob", {
        opacity: 0,
        scale: 0.85,
        duration: 0.8
      });

      tl.from(".auth-page .auth-card", {
        opacity: 0,
        y: 40,
        duration: 0.7
      }, "-=0.3");

      tl.from(".auth-page .auth-card .input-group", {
        opacity: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.08
      });

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-page-full">
        
        <Header />

        <div className="auth-page-wrapper auth-bg">
          
          {/* Blobs */}
          <div className="auth-bg-blob blob-left" />
          <div className="auth-bg-blob blob-right" />

          {/* Card */}
          <div className="auth-card glass-card">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">
              Join VibeTrack for free and start saving your playlists.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {password && (
                <div className="password-strength">
                  <div className={`strength-bar strength-${getStrengthClass(password)}`}></div>
                  <span className="strength-text">{getStrengthText(password)}</span>
                </div>
              )}

              {message && (
                <p className={messageType === "success" ? "success-message" : "error-message"}>
                  {message}
                </p>
              )}

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="button-spinner"></span>
                    Signing up...
                  </>
                ) : (
                  <>
                    <FaUserPlus style={{ marginRight: "10px" }} /> Sign Up
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-cta">
              <p>
                Already have an account?{" "}
                <span className="link-like" onClick={() => navigate("/login")}>
                  Log In
                </span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
