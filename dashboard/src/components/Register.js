import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShowChart, Person, Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import "./Login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.userName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3002/register", {
        userName: formData.userName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Success
      setSuccess("Account created successfully! Redirecting...");
      
      // Store token and username
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.userName);

      // Redirect after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Registration failed. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <ShowChart style={{ fontSize: "3rem", color: "var(--color-blue)" }} />
          <h1>TradeX</h1>
          <p>Professional Trading Platform</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="auth-form">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Start your trading journey</p>

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">✅ {success}</div>}

          <div className="input-group">
            <Person className="input-icon" />
            <input
              type="text"
              name="userName"
              placeholder="Full name"
              value={formData.userName}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <Email className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-blue auth-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Background Animation */}
      <div className="auth-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
};

export default Register;