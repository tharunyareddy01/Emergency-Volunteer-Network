import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

const emergencyTypes = [
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

const priorities = [
  "Critical",
  "High",
  "Medium",
  "Low"
];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-"
];

function RequesterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // =========================
  // EMERGENCY STATES
  // =========================
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // FORM STATES
  // =========================
  const [type, setType] = useState("Medical Assistance");
  const [priority, setPriority] = useState("High");
  const [description, setDescription] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [requiredSkill, setRequiredSkill] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

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

      if (parsedUser.role !== "requester") {
        navigate("/login");
        return;
      }

      setUser(parsedUser);

      if (parsedUser.phone) {
        setPhoneNumber(parsedUser.phone);
      }
    } catch (err) {
      console.error("User parsing error:", err);
      localStorage.removeItem("evnUser");
      navigate("/login");
    }
  }, [navigate]);

  // =========================
  // GET CURRENT LOCATION
  // =========================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setError("");
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setLocation(
          `GPS Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
        );

        setMessage("Current location captured successfully.");
        setLocationLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);

        setError(
          "Unable to get your location. Please enter your location manually."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // =========================
  // FETCH REQUESTER EMERGENCIES
  // =========================
  const fetchEmergencies = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/emergencies/requester/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load emergencies."
        );
      }

      setEmergencies(data.emergencies || []);
    } catch (err) {
      console.error("Emergency loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // =========================
  // EMERGENCY POLLING
  // =========================
  useEffect(() => {
    if (!user?.id) return;

    fetchEmergencies();

    const interval = setInterval(() => {
      fetchEmergencies();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id, fetchEmergencies]);

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
          data.message || "Failed to load notifications."
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
  // MARK NOTIFICATION READ
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
          data.message ||
            "Unable to mark notification as read."
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
      console.error(
        "Mark notification read error:",
        err
      );
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
          data.message ||
            "Unable to mark notifications as read."
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
      console.error(
        "Mark all notifications error:",
        err
      );
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
  // CREATE EMERGENCY
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!description.trim()) {
      setError("Please enter an emergency description.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please enter a phone number.");
      return;
    }

    if (
      type === "Blood Donation" &&
      !bloodGroup
    ) {
      setError(
        "Please select the required blood group."
      );
      return;
    }

    try {
      setSubmitLoading(true);

      const response = await fetch(
        `${API_URL}/emergencies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requesterId: user.id,
            type,
            priority,
            description: description.trim(),
            bloodGroup,
            requiredSkill: requiredSkill.trim(),
            location: location.trim(),
            latitude,
            longitude,
            phoneNumber: phoneNumber.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create emergency request."
        );
      }

      setMessage(
        "Emergency request created successfully."
      );

      setDescription("");
      setBloodGroup("");
      setRequiredSkill("");
      setLocation("");
      setLatitude(null);
      setLongitude(null);

      await fetchEmergencies();
      await fetchNotifications();
    } catch (err) {
      console.error("Create emergency error:", err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // =========================
  // CANCEL EMERGENCY
  // =========================
  const cancelEmergency = async (emergencyId) => {
    try {
      setCancelLoading((previous) => ({
        ...previous,
        [emergencyId]: true
      }));

      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/emergencies/${emergencyId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requesterId: user.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to cancel emergency."
        );
      }

      setMessage(
        "Emergency request cancelled successfully."
      );

      await fetchEmergencies();
      await fetchNotifications();
    } catch (err) {
      console.error("Cancel emergency error:", err);
      setError(err.message);
    } finally {
      setCancelLoading((previous) => ({
        ...previous,
        [emergencyId]: false
      }));
    }
  };

  // =========================
  // FETCH CHAT
  // =========================
  const fetchChatMessages = useCallback(
    async (emergencyId) => {
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
            data.message ||
              "Failed to load chat messages."
          );
        }

        setChatMessages((previous) => ({
          ...previous,
          [emergencyId]: data.messages || []
        }));
      } catch (err) {
        console.error(
          "Chat loading error:",
          err
        );
      } finally {
        setChatLoading((previous) => ({
          ...previous,
          [emergencyId]: false
        }));
      }
    },
    []
  );

  // =========================
  // CHAT POLLING
  // =========================
  useEffect(() => {
    const activeEmergencies = emergencies.filter(
      (emergency) =>
        emergency.status !== "Searching" &&
        emergency.status !== "Cancelled"
    );

    if (activeEmergencies.length === 0) {
      return;
    }

    activeEmergencies.forEach((emergency) => {
      fetchChatMessages(emergency._id);
    });

    const interval = setInterval(() => {
      activeEmergencies.forEach((emergency) => {
        fetchChatMessages(emergency._id);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [emergencies, fetchChatMessages]);

  // =========================
  // CHAT INPUT
  // =========================
  const handleChatInput = (
    emergencyId,
    value
  ) => {
    setChatInputs((previous) => ({
      ...previous,
      [emergencyId]: value
    }));
  };

  // =========================
  // SEND CHAT MESSAGE
  // =========================
  const sendChatMessage = async (emergencyId) => {
    const text =
      chatInputs[emergencyId]?.trim();

    if (!text || !user?.id) {
      return;
    }

    try {
      setChatSending((previous) => ({
        ...previous,
        [emergencyId]: true
      }));

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
          data.message ||
            "Failed to send message."
        );
      }

      setChatInputs((previous) => ({
        ...previous,
        [emergencyId]: ""
      }));

      await fetchChatMessages(emergencyId);
      await fetchNotifications();
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

      setError(err.message);
    } finally {
      setChatSending((previous) => ({
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
  // LOADING
  // =========================
  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading requester dashboard...</p>
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

          <h1>Requester Dashboard</h1>

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
                          key={notification._id}
                          className={
                            notification.isRead
                              ? "notification-item"
                              : "notification-item unread"
                          }
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
            SUCCESS / ERROR
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
            CREATE EMERGENCY
        ========================= */}
        <section className="create-emergency-card">

          <div className="section-heading">

            <div>

              <span className="card-label">
                NEED HELP?
              </span>

              <h2>
                Create Emergency Request
              </h2>

              <p>
                Submit an emergency request and
                suitable volunteers will be notified.
              </p>

            </div>

            <span className="emergency-heading-icon">
              🆘
            </span>

          </div>

          <form
            onSubmit={handleSubmit}
            className="emergency-form"
          >

            {/* TYPE */}
            <div className="form-group">

              <label>
                Emergency Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
              >

                {emergencyTypes.map(
                  (emergencyType) => (
                    <option
                      value={emergencyType}
                      key={emergencyType}
                    >
                      {emergencyType}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* PRIORITY */}
            <div className="form-group">

              <label>
                Priority
              </label>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
              >

                {priorities.map(
                  (priorityValue) => (
                    <option
                      value={priorityValue}
                      key={priorityValue}
                    >
                      {priorityValue}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* BLOOD GROUP */}
            <div className="form-group">

              <label>
                Required Blood Group
              </label>

              <select
                value={bloodGroup}
                onChange={(event) =>
                  setBloodGroup(event.target.value)
                }
              >

                <option value="">
                  Select blood group
                </option>

                {bloodGroups.map(
                  (group) => (
                    <option
                      value={group}
                      key={group}
                    >
                      {group}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* SKILL */}
            <div className="form-group">

              <label>
                Required Skill
              </label>

              <input
                type="text"
                value={requiredSkill}
                onChange={(event) =>
                  setRequiredSkill(
                    event.target.value
                  )
                }
                placeholder="Example: First Aid"
              />

            </div>

            {/* PHONE */}
            <div className="form-group">

              <label>
                Contact Phone Number
              </label>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(
                    event.target.value
                  )
                }
                placeholder="Enter phone number"
              />

            </div>

            {/* LOCATION */}
            <div className="form-group location-form-group">

              <label>
                Emergency Location
              </label>

              <div className="location-input-row">

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Enter location"
                />

                <button
                  type="button"
                  className="location-button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? "Getting..."
                    : "📍 Use GPS"}
                </button>

              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="form-group full-width">

              <label>
                Emergency Description
              </label>

              <textarea
                rows="5"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Explain the emergency clearly..."
              ></textarea>

            </div>

            {/* SUBMIT */}
            <div className="form-submit-row">

              <button
                type="submit"
                className="create-emergency-button"
                disabled={submitLoading}
              >

                {submitLoading
                  ? "Creating Request..."
                  : "🚨 Create Emergency Request"}

              </button>

            </div>

          </form>

        </section>

        {/* =========================
            EMERGENCY HISTORY
        ========================= */}
        <section className="history-section">

          <div className="section-heading">

            <div>

              <span className="card-label">
                YOUR REQUESTS
              </span>

              <h2>
                Emergency History
              </h2>

              <p>
                Track your emergency requests and
                volunteer responses.
              </p>

            </div>

            <span className="request-count">
              {emergencies.length} Requests
            </span>

          </div>

          {loading ? (

            <div className="empty-state">

              <div className="loading-spinner"></div>

              <p>
                Loading emergency requests...
              </p>

            </div>

          ) : emergencies.length === 0 ? (

            <div className="empty-state">

              <span className="empty-icon">
                📋
              </span>

              <h3>
                No emergency requests yet
              </h3>

              <p>
                Your emergency requests will appear
                here after you create one.
              </p>

            </div>

          ) : (

            <div className="emergency-list">

              {emergencies.map(
                (emergency) => (

                  <article
                    className="emergency-card requester-emergency-card"
                    key={emergency._id}
                  >

                    {/* HEADER */}
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

                    {/* DETAILS */}
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
                          📞 Contact
                        </span>

                        <strong>
                          {emergency.phoneNumber ||
                            phoneNumber ||
                            "Not available"}
                        </strong>

                      </div>

                    </div>

                    {/* STATUS */}
                    <div className="emergency-status-row">

                      <span className="status-label">
                        CURRENT STATUS
                      </span>

                      <span
                        className={`status-badge ${emergency.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {emergency.status}
                      </span>

                    </div>

                    {/* VOLUNTEER */}
                    {emergency.assignedVolunteerId && (

                      <div className="assigned-volunteer-box">

                        <div className="assigned-volunteer-icon">
                          🤝
                        </div>

                        <div>

                          <span>
                            VOLUNTEER ASSIGNED
                          </span>

                          <strong>
                            Volunteer is helping
                            with this emergency.
                          </strong>

                        </div>

                      </div>

                    )}

                    {/* CANCEL */}
                    {(emergency.status ===
                      "Searching" ||
                      emergency.status ===
                        "Volunteer Assigned" ||
                      emergency.status ===
                        "Accepted") && (

                      <button
                        type="button"
                        className="cancel-emergency-button"
                        onClick={() =>
                          cancelEmergency(
                            emergency._id
                          )
                        }
                        disabled={
                          cancelLoading[
                            emergency._id
                          ]
                        }
                      >

                        {cancelLoading[
                          emergency._id
                        ]
                          ? "Cancelling..."
                          : "✕ Cancel Emergency"}

                      </button>

                    )}

                    {/* =========================
                        CHAT
                    ========================= */}
                    {emergency.status !==
                      "Searching" &&
                      emergency.status !==
                        "Cancelled" && (

                      <div className="emergency-chat-box">

                        <div className="emergency-chat-header">

                          <div>

                            <span className="chat-icon">
                              💬
                            </span>

                            <div>

                              <strong>
                                Volunteer Chat
                              </strong>

                              <small>
                                Communicate with your
                                volunteer
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
                                  You can communicate
                                  with your volunteer
                                  here.
                                </small>

                              </div>

                            )}

                          {chatMessages[
                            emergency._id
                          ]?.map(
                            (chatMessage) => {

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
                                          "Volunteer"}

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
                            }
                          )}

                        </div>

                        {/* CHAT INPUT */}

                        {emergency.status !==
                          "Completed" && (

                          <div className="emergency-chat-input">

                            <input
                              type="text"
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
                                  event.key ===
                                  "Enter"
                                ) {
                                  sendChatMessage(
                                    emergency._id
                                  );
                                }

                              }}
                              placeholder="Type a message..."
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

                        )}

                      </div>

                    )}

                    {/* COMPLETED */}
                    {emergency.status ===
                      "Completed" && (

                      <div className="completed-box">

                        <span>
                          ✓
                        </span>

                        <div>

                          <strong>
                            Emergency Completed
                          </strong>

                          <p>
                            Your emergency request
                            has been successfully
                            completed.
                          </p>

                        </div>

                      </div>

                    )}

                    {/* CANCELLED */}
                    {emergency.status ===
                      "Cancelled" && (

                      <div className="cancelled-box">

                        <span>
                          ✕
                        </span>

                        <div>

                          <strong>
                            Emergency Cancelled
                          </strong>

                          <p>
                            This emergency request
                            has been cancelled.
                          </p>

                        </div>

                      </div>

                    )}

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default RequesterDashboard;