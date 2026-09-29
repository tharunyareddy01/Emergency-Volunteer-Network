import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

const emergencyOptions = [
  "Blood Donation",
  "Medical Assistance",
  "First Aid",
  "Emergency Transport",
  "Food/Water Assistance",
  "Disaster Assistance",
  "Elderly Assistance",
  "Disability Assistance",
  "Missing Person Assistance",
  "Other Emergency"
];

const skillOptions = [
  "First Aid",
  "Basic Medical Assistance",
  "Blood Donation",
  "Emergency Transport",
  "Food Distribution",
  "Water Distribution",
  "Disaster Relief",
  "Elderly Care",
  "Disability Assistance",
  "Search Assistance"
];

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "requester",

    bloodGroup: "",
    skills: [],
    emergencyTypes: [],
    location: "",
    latitude: "",
    longitude: ""
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

  const handleRoleChange = (event) => {
    const role = event.target.value;

    setFormData((previous) => ({
      ...previous,
      role
    }));

    setError("");
  };

  const handleCheckboxChange = (event, field) => {
    const { value, checked } = event.target;

    setFormData((previous) => {
      const currentValues = previous[field];

      if (checked) {
        return {
          ...previous,
          [field]: [...currentValues, value]
        };
      }

      return {
        ...previous,
        [field]: currentValues.filter(
          (item) => item !== value
        )
      };
    });
  };

  const getLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((previous) => ({
          ...previous,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));

        setSuccess(
          "Current location coordinates captured successfully."
        );
      },
      () => {
        setError(
          "Location permission was denied. You can enter your general location manually."
        );
      }
    );
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Please fill all required fields.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      return "Phone number must contain exactly 10 digits.";
    }

    if (formData.role === "volunteer") {
      if (!formData.bloodGroup) {
        return "Please select your blood group.";
      }

      if (formData.skills.length === 0) {
        return "Please select at least one skill.";
      }

      if (formData.emergencyTypes.length === 0) {
        return "Please select at least one emergency type.";
      }

      if (!formData.location) {
        return "Please enter your general location.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Registration failed."
        );
        return;
      }

      setSuccess(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        "Unable to connect to the server. Make sure the server is running on port 4000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">

      <div className="signup-wrapper">

        <div className="signup-header">
          <Link to="/" className="signup-logo">
            <span>EVN</span>
            <div>
              <strong>
                Emergency Volunteer Network
              </strong>
              <small>
                Help when it matters most
              </small>
            </div>
          </Link>

          <Link to="/login" className="login-link">
            Already have an account? <strong>Login</strong>
          </Link>
        </div>

        <div className="signup-card">

          <div className="auth-heading signup-heading">
            <span>JOIN EVN</span>
            <h2>Create Your Account</h2>
            <p>
              Become part of a community ready to help
              during emergencies.
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

            <div className="form-section-title">
              <span>01</span>
              Basic Information
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Full Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Email Address <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Phone Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit phone number"
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Account Type <span>*</span>
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                >
                  <option value="requester">
                    Requester - I Need Help
                  </option>

                  <option value="volunteer">
                    Volunteer - I Want to Help
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Password <span>*</span>
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Confirm Password <span>*</span>
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

            </div>

            {formData.role === "volunteer" && (
              <>

                <div className="form-section-title">
                  <span>02</span>
                  Volunteer Information
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Blood Group <span>*</span>
                    </label>

                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select blood group
                      </option>

                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      General Location <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="location"
                      placeholder="Example: Kurnool"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <div className="location-box">

                  <div>
                    <strong>
                      📍 Optional GPS Location
                    </strong>

                    <p>
                      Use your browser location to help
                      match you with nearby emergencies.
                    </p>

                    {formData.latitude &&
                      formData.longitude && (
                        <small>
                          Latitude: {formData.latitude}
                          {" | "}
                          Longitude: {formData.longitude}
                        </small>
                      )}
                  </div>

                  <button
                    type="button"
                    className="location-btn"
                    onClick={getLocation}
                  >
                    📍 Get My Location
                  </button>

                </div>

                <div className="checkbox-section">

                  <label>
                    Skills <span>*</span>
                  </label>

                  <div className="checkbox-grid">

                    {skillOptions.map((skill) => (
                      <label
                        className="checkbox-item"
                        key={skill}
                      >
                        <input
                          type="checkbox"
                          value={skill}
                          checked={formData.skills.includes(
                            skill
                          )}
                          onChange={(event) =>
                            handleCheckboxChange(
                              event,
                              "skills"
                            )
                          }
                        />

                        <span>{skill}</span>
                      </label>
                    ))}

                  </div>
                </div>

                <div className="checkbox-section">

                  <label>
                    Emergency Types You Can Help With{" "}
                    <span>*</span>
                  </label>

                  <div className="checkbox-grid">

                    {emergencyOptions.map(
                      (emergency) => (
                        <label
                          className="checkbox-item"
                          key={emergency}
                        >
                          <input
                            type="checkbox"
                            value={emergency}
                            checked={formData.emergencyTypes.includes(
                              emergency
                            )}
                            onChange={(event) =>
                              handleCheckboxChange(
                                event,
                                "emergencyTypes"
                              )
                            }
                          />

                          <span>{emergency}</span>
                        </label>
                      )
                    )}

                  </div>
                </div>

              </>
            )}

            <div className="signup-submit-area">

              <button
                type="submit"
                className="auth-submit signup-submit"
                disabled={loading}
              >
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE ACCOUNT"}
              </button>

              <p>
                By creating an account, you agree to use
                EVN responsibly during emergency
                situations.
              </p>

            </div>

          </form>
        </div>

        <div className="auth-disclaimer">
          ⚠️ EVN is a college project for volunteer
          coordination. It does not replace official
          emergency services.
        </div>

      </div>
    </div>
  );
}

export default Signup;