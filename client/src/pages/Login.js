import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem(
        "evnUser",
        JSON.stringify(data.user)
      );

      if (data.volunteer) {
        localStorage.setItem(
          "evnVolunteer",
          JSON.stringify(data.volunteer)
        );
      } else {
        localStorage.removeItem("evnVolunteer");
      }

      setSuccess("Login successful. Redirecting...");

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "volunteer") {
          navigate("/volunteer");
        } else {
          navigate("/requester");
        }
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Unable to connect to the server. Make sure the server is running on port 4000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <div className="auth-logo">EVN</div>

          <h1>Emergency Volunteer Network</h1>

          <p>
            When every second matters, help should be
            closer than you think.
          </p>

          <div className="auth-emergency-box">
            <span>🚨</span>
            <div>
              <strong>Need emergency assistance?</strong>
              <small>
                Connect with available volunteers quickly.
              </small>
            </div>
          </div>
        </div>

        <div className="auth-card">

          <div className="auth-heading">
            <span>WELCOME BACK</span>
            <h2>Login to EVN</h2>
            <p>
              Access your emergency volunteer account.
            </p>
          </div>

          {error && (
            <div className="message error-message">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="message success-message">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>

          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            Don't have an account?

            <Link to="/signup">
              Create an account
            </Link>
          </p>

          <Link to="/" className="back-home">
            ← Back to Home
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Login;