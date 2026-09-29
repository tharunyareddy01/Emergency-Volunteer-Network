import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

function VolunteerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [volunteer, setVolunteer] = useState(null);

  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [statusLoading, setStatusLoading] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // CHAT STATES
  // =========================
  const [chatMessages, setChatMessages] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [chatLoading, setChatLoading] = useState({});
  const [chatSending, setChatSending] = useState({});

  // =========================
  // NOTIFICATION STATES
  // =========================
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("evnUser");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "volunteer") {
        navigate("/login");
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      console.error("User parsing error:", err);
      localStorage.removeItem("evnUser");
      navigate("/login");
    }
  }, [navigate]);

  // =========================
  // FETCH VOLUNTEER PROFILE
  // =========================
  const fetchVolunteerProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_URL}/volunteers/profile/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load volunteer profile"
        );
      }

      setVolunteer(data.volunteer);
    } catch (err) {
      console.error("Volunteer profile error:", err);
      setError(err.message);
    }
  }, [user]);

  useEffect(() => {
    fetchVolunteerProfile();
  }, [fetchVolunteerProfile]);

  // =========================
  // FETCH SUITABLE EMERGENCIES
  // =========================
  const fetchSuitableEmergencies = useCallback(async () => {
    if (!volunteer?.id || volunteer.availability !== true) {
      setEmergencies([]);
      return;
    }

    try {
      setEmergencyLoading(true);

      const response = await fetch(
         `${API_URL}/emergencies/volunteer/${volunteer.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load emergencies"
        );
      }

      setEmergencies(data.emergencies || []);
    } catch (err) {
      console.error("Emergency loading error:", err);
      setError(err.message);
    } finally {
      setEmergencyLoading(false);
    }
  }, [volunteer]);

  // =========================
  // EMERGENCY POLLING
  // =========================
  useEffect(() => {
    if (!volunteer?.availability) return;

    fetchSuitableEmergencies();

    const interval = setInterval(() => {
      fetchSuitableEmergencies();
    }, 5000);

    return () => clearInterval(interval);
  }, [volunteer?.availability, fetchSuitableEmergencies]);

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setNotificationLoading(true);

      const response = await fetch(
        `${API_URL}/notifications/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications"
        );
      }

      setNotifications(data.notifications || []);
      setUnreadNotifications(data.unreadCount || 0);
    } catch (err) {
      console.error("Notification loading error:", err);
    } finally {
      setNotificationLoading(false);
    }
  }, [user?.id]);

  // =========================
  // NOTIFICATION POLLING
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  // =========================
  // MARK NOTIFICATION AS READ
  // =========================
  const markNotificationRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to mark notification as read"
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true
              }
            : notification
        )
      );

      setUnreadNotifications((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    } catch (err) {
      console.error("Mark notification read error:", err);
    }
  };

  // =========================
  // MARK ALL NOTIFICATIONS READ
  // =========================
  const markAllNotificationsRead = async () => {
    if (!user?.id || unreadNotifications === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/user/${user.id}/read-all`,
        {
          method: "PATCH"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to mark notifications as read"
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true
        }))
      );

      setUnreadNotifications(0);
    } catch (err) {
      console.error("Mark all notifications error:", err);
    }
  };

  // =========================
  // NOTIFICATION TIME
  // =========================
  const getNotificationTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short"
    });
  };

  // =========================
  // CHAT - FETCH MESSAGES
  // =========================
  const fetchChatMessages = useCallback(async (emergencyId) => {
    try {
      setChatLoading((previous) => ({
        ...previous,
        [emergencyId]: true
      }));

      const response = await fetch(
        `${API_URL}/messages/${emergencyId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load chat messages"
        );
      }

      setChatMessages((previous) => ({
        ...previous,
        [emergencyId]: data.messages || []
      }));
    } catch (err) {
      console.error("Chat loading error:", err);
    } finally {
      setChatLoading((previous) => ({
        ...previous,
        [emergencyId]: false
      }));
    }
  }, []);

  // =========================
  // CHAT POLLING
  // =========================
  useEffect(() => {
    const acceptedEmergencies = emergencies.filter(
      (emergency) =>
        emergency.status !== "Searching" &&
        emergency.status !== "Cancelled" &&
        emergency.status !== "Completed"
    );

    if (acceptedEmergencies.length === 0) return;

    acceptedEmergencies.forEach((emergency) => {
      fetchChatMessages(emergency._id);
    });

    const interval = setInterval(() => {
      acceptedEmergencies.forEach((emergency) => {
        fetchChatMessages(emergency._id);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [emergencies, fetchChatMessages]);

  // =========================
  // CHAT INPUT
  // =========================
  const handleChatInput = (emergencyId, value) => {
    setChatInputs((previous) => ({
      ...previous,
      [emergencyId]: value
    }));
  };

  // =========================
  // SEND CHAT MESSAGE
  // =========================
  const sendChatMessage = async (emergencyId) => {
    const text = chatInputs[emergencyId]?.trim();

    if (!text || !user?.id) return;

    setChatSending((previous) => ({
      ...previous,
      [emergencyId]: true
    }));

    try {
      const response = await fetch(
        `${API_URL}/messages/${emergencyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            senderId: user.id,
            message: text
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send message"
        );
      }

      setChatInputs((previous) => ({
        ...previous,
        [emergencyId]: ""
      }));

      setChatMessages((previous) => ({
        ...previous,
        [emergencyId]: [
          ...(previous[emergencyId] || []),
          data.chatMessage
        ]
      }));

      // Refresh notifications after sending a message
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setChatSending((previous) => ({
        ...previous,
        [emergencyId]: false
      }));
    }
  };

  // =========================
  // TOGGLE AVAILABILITY
  // =========================
  const toggleAvailability = async () => {
    if (!volunteer?.id) return;

    if (volunteer.verificationStatus !== "verified") {
      setError(
        "Your volunteer account must be verified by admin before becoming available."
      );
      return;
    }

    try {
      setAvailabilityLoading(true);
      setMessage("");
      setError("");

      const newAvailability = !volunteer.availability;

      const response = await fetch(
        `${API_URL}/volunteers/availability/${volunteer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            availability: newAvailability
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update availability"
        );
      }

      setVolunteer(data.volunteer);

      setMessage(
        newAvailability
          ? "You are now available for emergencies."
          : "You are now unavailable."
      );

      if (!newAvailability) {
        setEmergencies([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // =========================
  // ACCEPT EMERGENCY
  // =========================
  const acceptEmergency = async (emergencyId) => {
    if (!volunteer?.id) return;

    try {
      setActionLoading((previous) => ({
        ...previous,
        [emergencyId]: true
      }));

      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/emergencies/${emergencyId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            volunteerId: volunteer.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to accept emergency"
        );
      }

      setMessage("Emergency accepted successfully.");

      setEmergencies((previous) =>
        previous.map((emergency) =>
          emergency._id === emergencyId
            ? data.emergency
            : emergency
        )
      );

      await fetchVolunteerProfile();
      await fetchNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading((previous) => ({
        ...previous,
        [emergencyId]: false
      }));
    }
  };

  // =========================
  // REJECT EMERGENCY
  // =========================
  const rejectEmergency = (emergencyId) => {
    setEmergencies((previous) =>
      previous.filter(
        (emergency) => emergency._id !== emergencyId
      )
    );

    setMessage("Emergency request rejected.");
  };

  // =========================
  // UPDATE EMERGENCY STATUS
  // =========================
  const updateEmergencyStatus = async (
    emergencyId,
    status
  ) => {
    if (!volunteer?.id) return;

    try {
      setStatusLoading((previous) => ({
        ...previous,
        [emergencyId]: true
      }));

      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/emergencies/${emergencyId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            volunteerId: volunteer.id,
            status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update emergency status"
        );
      }

      setMessage(`Emergency status updated to "${status}".`);

      setEmergencies((previous) =>
        previous.map((emergency) =>
          emergency._id === emergencyId
            ? data.emergency
            : emergency
        )
      );

      await fetchVolunteerProfile();
      await fetchNotifications();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusLoading((previous) => ({
        ...previous,
        [emergencyId]: false
      }));
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("evnUser");
    localStorage.removeItem("evnVolunteer");
    navigate("/login");
  };

  // =========================
  // STATUS ORDER
  // =========================
  const statusSteps = [
    "Accepted",
    "On the Way",
    "Help In Progress",
    "Completed"
  ];

  // =========================
  // RENDER
  // =========================
  if (!user || !volunteer) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading volunteer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}
      <header className="dashboard-header">

        <div>
          <p className="dashboard-label">
            EMERGENCY VOLUNTEER NETWORK
          </p>

          <h1>Volunteer Dashboard</h1>

          <p>
            Welcome, <strong>{user.name}</strong>
          </p>
        </div>

        <div className="dashboard-header-actions">

          {/* =========================
              NOTIFICATION BUTTON
          ========================= */}
          <div className="notification-wrapper">

            <button
              type="button"
              className="notification-button"
              onClick={() =>
                setNotificationOpen(
                  (previous) => !previous
                )
              }
              aria-label="Notifications"
            >

              <span className="notification-bell">
                🔔
              </span>

              {unreadNotifications > 0 && (
                <span className="notification-count">
                  {unreadNotifications > 99
                    ? "99+"
                    : unreadNotifications}
                </span>
              )}

            </button>

            {/* =========================
                NOTIFICATION DROPDOWN
            ========================= */}
            {notificationOpen && (

              <div className="notification-dropdown">

                <div className="notification-dropdown-header">

                  <div>
                    <strong>
                      Notifications
                    </strong>

                    <small>
                      {unreadNotifications > 0
                        ? `${unreadNotifications} unread`
                        : "All caught up"}
                    </small>
                  </div>

                  {unreadNotifications > 0 && (

                    <button
                      type="button"
                      className="mark-all-read-button"
                      onClick={
                        markAllNotificationsRead
                      }
                    >
                      Mark all read
                    </button>

                  )}

                </div>

                <div className="notification-list">

                  {notificationLoading &&
                  notifications.length === 0 ? (

                    <div className="notification-empty">
                      Loading notifications...
                    </div>

                  ) : notifications.length === 0 ? (

                    <div className="notification-empty">

                      <span>
                        🔔
                      </span>

                      <p>
                        No notifications yet.
                      </p>

                    </div>

                  ) : (

                    notifications.map(
                      (notification) => (

                        <button
                          type="button"
                          className={
                            notification.isRead
                              ? "notification-item"
                              : "notification-item unread"
                          }
                          key={notification._id}
                          onClick={() => {

                            if (
                              !notification.isRead
                            ) {
                              markNotificationRead(
                                notification._id
                              );
                            }

                          }}
                        >

                          <div className="notification-icon">

                            {notification.type ===
                            "emergency"
                              ? "🚨"
                              : notification.type ===
                                "assignment"
                              ? "🤝"
                              : notification.type ===
                                "status"
                              ? "🔄"
                              : notification.type ===
                                "message"
                              ? "💬"
                              : "🔔"}

                          </div>

                          <div className="notification-content">

                            <strong>
                              {notification.title}
                            </strong>

                            <p>
                              {notification.message}
                            </p>

                            <small>
                              {getNotificationTime(
                                notification.createdAt
                              )}
                            </small>

                          </div>

                          {!notification.isRead && (
                            <span className="notification-unread-dot"></span>
                          )}

                        </button>

                      )
                    )

                  )}

                </div>

              </div>

            )}

          </div>

          {/* =========================
              LOGOUT
          ========================= */}
          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="dashboard-container">

        {/* =========================
            MESSAGES
        ========================= */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =========================
            PROFILE + AVAILABILITY
        ========================= */}
        <section className="volunteer-top-section">

          <div className="volunteer-profile-card">

            <div className="volunteer-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p>{user.phone}</p>
            </div>

          </div>

          <div className="availability-card">

            <div className="availability-info">

              <span
                className={
                  volunteer.availability
                    ? "availability-dot online"
                    : "availability-dot offline"
                }
              ></span>

              <div>

                <h3>
                  {volunteer.availability
                    ? "Available"
                    : "Unavailable"}
                </h3>

                <p>
                  {volunteer.availability
                    ? "You can receive emergency requests."
                    : "You are currently not receiving requests."}
                </p>

              </div>

            </div>

            <button
              className={
                volunteer.availability
                  ? "availability-button unavailable"
                  : "availability-button available"
              }
              onClick={toggleAvailability}
              disabled={availabilityLoading}
            >
              {availabilityLoading
                ? "Updating..."
                : volunteer.availability
                ? "Go Unavailable"
                : "Go Available"}
            </button>

          </div>

        </section>

        {/* =========================
            VERIFICATION
        ========================= */}
        <section className="verification-card">

          <div>

            <span className="card-label">
              VERIFICATION STATUS
            </span>

            <h2>Volunteer Verification</h2>

            <p>
              Your account must be verified by an admin
              before accepting emergency requests.
            </p>

          </div>

          <span
            className={`verification-badge ${volunteer.verificationStatus}`}
          >
            {volunteer.verificationStatus}
          </span>

        </section>

        {/* =========================
            VOLUNTEER STATS
        ========================= */}
        <section className="volunteer-stats">

          <div className="stat-card">

            <span className="stat-icon">
              🩸
            </span>

            <div>

              <span className="stat-label">
                BLOOD GROUP
              </span>

              <strong>
                {volunteer.bloodGroup}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              ⭐
            </span>

            <div>

              <span className="stat-label">
                RATING
              </span>

              <strong>
                {volunteer.rating || "0"}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              🤝
            </span>

            <div>

              <span className="stat-label">
                PEOPLE HELPED
              </span>

              <strong>
                {volunteer.totalHelps || 0}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span className="stat-icon">
              📍
            </span>

            <div>

              <span className="stat-label">
                LOCATION
              </span>

              <strong>
                {volunteer.location || "Not set"}
              </strong>

            </div>

          </div>

        </section>

        {/* =========================
            SKILLS
        ========================= */}
        <section className="skills-card">

          <div>

            <span className="card-label">
              VOLUNTEER PROFILE
            </span>

            <h2>Your Skills</h2>

          </div>

          <div className="tag-list">

            {volunteer.skills?.length > 0 ? (

              volunteer.skills.map((skill, index) => (

                <span
                  className="profile-tag"
                  key={index}
                >
                  {skill}
                </span>

              ))

            ) : (

              <span>
                No skills added.
              </span>

            )}

          </div>

        </section>

        {/* =========================
            EMERGENCY REQUESTS
        ========================= */}
        <section className="emergency-section">

          <div className="section-heading">

            <div>

              <span className="card-label">
                LIVE REQUESTS
              </span>

              <h2>
                Suitable Emergency Requests
              </h2>

              <p>
                New matching emergencies automatically
                appear here.
              </p>

            </div>

            {volunteer.availability && (
              <span className="live-badge">
                ● LIVE
              </span>
            )}

          </div>

          {emergencyLoading ? (

            <div className="empty-state">

              <div className="loading-spinner"></div>

              <p>
                Searching for emergencies...
              </p>

            </div>

          ) : emergencies.length === 0 ? (

            <div className="empty-state">

              <span className="empty-icon">
                🆘
              </span>

              <h3>
                No emergency requests
              </h3>

              <p>
                Matching emergency requests will appear
                automatically when you are available.
              </p>

            </div>

          ) : (

            <div className="emergency-list">

              {emergencies.map((emergency) => (

                <article
                  className="emergency-card"
                  key={emergency._id}
                >

                  {/* =========================
                      EMERGENCY HEADER
                  ========================= */}
                  <div className="emergency-card-header">

                    <div>

                      <span className="emergency-type">
                        {emergency.type}
                      </span>

                      <h3>
                        {emergency.description}
                      </h3>

                    </div>

                    <span
                      className={`priority-badge ${emergency.priority.toLowerCase()}`}
                    >
                      {emergency.priority}
                    </span>

                  </div>

                  {/* =========================
                      EMERGENCY DETAILS
                  ========================= */}
                  <div className="emergency-details">

                    <div>

                      <span>
                        📍 Location
                      </span>

                      <strong>
                        {emergency.location}
                      </strong>

                    </div>

                    <div>

                      <span>
                        🩸 Blood Group
                      </span>

                      <strong>
                        {emergency.bloodGroup ||
                          "Not specified"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        🛠 Required Skill
                      </span>

                      <strong>
                        {emergency.requiredSkill ||
                          "Not specified"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        📞 Requester Phone
                      </span>

                      <strong>
                        {emergency.phoneNumber ||
                          "Not available"}
                      </strong>

                    </div>

                  </div>

                  {/* =========================
                      STATUS
                  ========================= */}
                  <div className="emergency-status-row">

                    <span className="status-label">
                      STATUS
                    </span>

                    <span
                      className={`status-badge ${emergency.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {emergency.status}
                    </span>

                  </div>

                  {/* =========================
                      ACCEPT / REJECT
                  ========================= */}
                  {emergency.status === "Searching" && (

                    <div className="emergency-actions">

                      <button
                        className="accept-button"
                        onClick={() =>
                          acceptEmergency(
                            emergency._id
                          )
                        }
                        disabled={
                          actionLoading[
                            emergency._id
                          ]
                        }
                      >
                        {actionLoading[
                          emergency._id
                        ]
                          ? "Accepting..."
                          : "✓ Accept Emergency"}
                      </button>

                      <button
                        className="reject-button"
                        onClick={() =>
                          rejectEmergency(
                            emergency._id
                          )
                        }
                        disabled={
                          actionLoading[
                            emergency._id
                          ]
                        }
                      >
                        ✕ Reject
                      </button>

                    </div>

                  )}

                  {/* =========================
                      STATUS PROGRESSION
                  ========================= */}
                  {emergency.status !== "Searching" &&
                    emergency.status !== "Cancelled" && (

                    <div className="status-progression">

                      <div className="status-progression-title">
                        Emergency Progress
                      </div>

                      <div className="status-steps">

                        {statusSteps.map(
                          (step, index) => {

                            const currentIndex =
                              statusSteps.indexOf(
                                emergency.status
                              );

                            const completed =
                              index <= currentIndex;

                            return (
                              <div
                                className={
                                  completed
                                    ? "status-step completed"
                                    : "status-step"
                                }
                                key={step}
                              >

                                <div className="status-step-circle">

                                  {completed
                                    ? "✓"
                                    : index + 1}

                                </div>

                                <span>
                                  {step}
                                </span>

                              </div>
                            );
                          }
                        )}

                      </div>

                      {/* NEXT STATUS BUTTON */}
                      {emergency.status !==
                        "Completed" && (

                        <button
                          className="status-update-button"
                          onClick={() => {

                            const currentIndex =
                              statusSteps.indexOf(
                                emergency.status
                              );

                            const nextStatus =
                              statusSteps[
                                currentIndex + 1
                              ];

                            if (nextStatus) {
                              updateEmergencyStatus(
                                emergency._id,
                                nextStatus
                              );
                            }

                          }}
                          disabled={
                            statusLoading[
                              emergency._id
                            ]
                          }
                        >

                          {statusLoading[
                            emergency._id
                          ]
                            ? "Updating..."
                            : `Move to ${
                                statusSteps[
                                  statusSteps.indexOf(
                                    emergency.status
                                  ) + 1
                                ]
                              }`}

                        </button>

                      )}

                    </div>

                  )}

                  {/* =========================
                      EMERGENCY CHAT
                  ========================= */}
                  {emergency.status !== "Searching" &&
                    emergency.status !== "Cancelled" &&
                    emergency.status !== "Completed" && (

                    <div className="emergency-chat-box">

                      <div className="emergency-chat-header">

                        <div>

                          <span className="chat-icon">
                            💬
                          </span>

                          <div>

                            <strong>
                              Emergency Chat
                            </strong>

                            <small>
                              Chat with the requester
                            </small>

                          </div>

                        </div>

                        <span className="chat-live">
                          ● LIVE
                        </span>

                      </div>

                      <div className="emergency-chat-messages">

                        {chatLoading[
                          emergency._id
                        ] &&
                          (!chatMessages[
                            emergency._id
                          ] ||
                            chatMessages[
                              emergency._id
                            ].length === 0) && (

                            <div className="chat-loading">
                              Loading messages...
                            </div>

                          )}

                        {!chatLoading[
                          emergency._id
                        ] &&
                          (!chatMessages[
                            emergency._id
                          ] ||
                            chatMessages[
                              emergency._id
                            ].length === 0) && (

                            <div className="chat-empty">

                              <span>
                                💬
                              </span>

                              <p>
                                No messages yet.
                              </p>

                              <small>
                                Send a message to
                                communicate with the
                                requester.
                              </small>

                            </div>

                          )}

                        {chatMessages[
                          emergency._id
                        ]?.map((chatMessage) => {

                          const isMine =
                            chatMessage.senderId?._id ===
                              user.id ||
                            chatMessage.senderId ===
                              user.id;

                          return (
                            <div
                              className={
                                isMine
                                  ? "chat-message-row mine"
                                  : "chat-message-row"
                              }
                              key={
                                chatMessage._id
                              }
                            >

                              <div className="chat-message">

                                <div className="chat-message-name">

                                  {isMine
                                    ? "You"
                                    : chatMessage
                                        .senderId
                                        ?.name ||
                                      "Requester"}

                                </div>

                                <p>
                                  {
                                    chatMessage.message
                                  }
                                </p>

                                <small>
                                  {new Date(
                                    chatMessage.createdAt
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    }
                                  )}
                                </small>

                              </div>

                            </div>
                          );
                        })}

                      </div>

                      <div className="emergency-chat-input">

                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={
                            chatInputs[
                              emergency._id
                            ] || ""
                          }
                          onChange={(event) =>
                            handleChatInput(
                              emergency._id,
                              event.target.value
                            )
                          }
                          onKeyDown={(event) => {

                            if (
                              event.key === "Enter"
                            ) {
                              sendChatMessage(
                                emergency._id
                              );
                            }

                          }}
                          disabled={
                            chatSending[
                              emergency._id
                            ]
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            sendChatMessage(
                              emergency._id
                            )
                          }
                          disabled={
                            chatSending[
                              emergency._id
                            ] ||
                            !chatInputs[
                              emergency._id
                            ]?.trim()
                          }
                        >

                          {chatSending[
                            emergency._id
                          ]
                            ? "..."
                            : "➤"}

                        </button>

                      </div>

                    </div>

                  )}

                  {/* =========================
                      COMPLETED
                  ========================= */}
                  {emergency.status === "Completed" && (

                    <div className="completed-box">

                      <span>
                        ✓
                      </span>

                      <div>

                        <strong>
                          Emergency Completed
                        </strong>

                        <p>
                          Thank you for helping someone
                          in need.
                        </p>

                      </div>

                    </div>

                  )}

                  {/* =========================
                      CANCELLED
                  ========================= */}
                  {emergency.status === "Cancelled" && (

                    <div className="cancelled-box">

                      <span>
                        ✕
                      </span>

                      <div>

                        <strong>
                          Emergency Cancelled
                        </strong>

                        <p>
                          This emergency request has
                          been cancelled.
                        </p>

                      </div>

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default VolunteerDashboard;