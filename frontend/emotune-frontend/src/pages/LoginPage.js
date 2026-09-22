
import React, { useState, useLayoutEffect } from "react";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./Auth.css";
import gsap from "gsap";
import { loginUser } from "../api/backend";

const Login = () => {
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

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(email, password);

      if (response.error) {
        setMessage(response.error);
        setMessageType("error");
        return;
      }

      const safeUserData = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
      };

      localStorage.setItem("user", JSON.stringify(safeUserData));
      if (response.token) localStorage.setItem("token", response.token);

      sessionStorage.removeItem("freshLogin");
      window.onpopstate = null;

      navigate("/vibetrack", { replace: true });
    } catch (error) {
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
          <div className="auth-bg-blob blob-left" />
          <div className="auth-bg-blob blob-right" />

          {/* card */}
          <div className="auth-card glass-card">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Log in to access your saved playlists.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
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

              {message && (
                <p className={messageType === "success" ? "success-message" : "error-message"}>
                  {message}
                </p>
              )}

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="button-spinner"></span> Logging in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt style={{ marginRight: "10px" }} /> Log In
                  </>
                )}
              </button>

              <p className="auth-link-row">
                <span className="link-like" onClick={() => navigate("/forgot-password")}>
                  Forgot Password?
                </span>
              </p>
            </form>

            <div className="auth-footer-cta">
              <p>
                Don't have an account?{" "}
                <span className="link-like" onClick={() => navigate("/signup")}>
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
