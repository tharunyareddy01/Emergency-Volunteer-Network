import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("evnUser") || "null"
  );

  const [volunteers, setVolunteers] = useState([]);
  const [requesters, setRequesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    localStorage.removeItem("evnUser");
    localStorage.removeItem("evnVolunteer");

    navigate("/login");
  };

  /* =========================================================
     FETCH VOLUNTEERS
  ========================================================= */

  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/volunteers`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to fetch volunteers."
        );
        return;
      }

      setVolunteers(data.volunteers || []);

    } catch (error) {
      console.error(
        "Fetch volunteers error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     FETCH REQUESTERS
  ========================================================= */

  const fetchRequesters = useCallback(async () => {
    try {
      setUsersLoading(true);

      const response = await fetch(
        `${API_URL}/auth/users`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to fetch users."
        );
        return;
      }

      const allUsers = data.users || [];

      const requesterUsers =
        allUsers.filter(
          (user) =>
            user.role === "requester"
        );

      setRequesters(requesterUsers);

    } catch (error) {
      console.error(
        "Fetch requesters error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setUsersLoading(false);
    }
  }, []);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadAdminData = useCallback(async () => {
    await Promise.all([
      fetchVolunteers(),
      fetchRequesters()
    ]);
  }, [
    fetchVolunteers,
    fetchRequesters
  ]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  /* =========================================================
     VERIFY VOLUNTEER
  ========================================================= */

  const verifyVolunteer = async (
    volunteerId
  ) => {
    try {
      setActionLoading(volunteerId);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/volunteers/verify/${volunteerId}`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to verify volunteer."
        );
        return;
      }

      setMessage(
        "Volunteer verified successfully."
      );

      await fetchVolunteers();

    } catch (error) {
      console.error(
        "Verify volunteer error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setActionLoading("");
    }
  };

  /* =========================================================
     REJECT VOLUNTEER
  ========================================================= */

  const rejectVolunteer = async (
    volunteerId
  ) => {
    try {
      setActionLoading(volunteerId);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/volunteers/reject/${volunteerId}`,
        {
          method: "PUT"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reject volunteer."
        );
        return;
      }

      setMessage(
        "Volunteer rejected successfully."
      );

      await fetchVolunteers();

    } catch (error) {
      console.error(
        "Reject volunteer error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    } finally {
      setActionLoading("");
    }
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const totalVolunteers =
    volunteers.length;

  const totalRequesters =
    requesters.length;

  const pendingVolunteers =
    volunteers.filter(
      (volunteer) =>
        volunteer.verificationStatus ===
        "pending"
    ).length;

  const verifiedVolunteers =
    volunteers.filter(
      (volunteer) =>
        volunteer.verificationStatus ===
        "verified"
    ).length;

  const rejectedVolunteers =
    volunteers.filter(
      (volunteer) =>
        volunteer.verificationStatus ===
        "rejected"
    ).length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dashboard-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="dashboard-topbar">

        <div className="dashboard-logo">

          <span>EVN</span>

          <strong>
            EVN Administration
          </strong>

        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="temporary-dashboard">

        {/* ===================================================
            WELCOME
        =================================================== */}

        <div className="dashboard-welcome">

          <span>
            ADMIN DASHBOARD
          </span>

          <h1>
            Welcome,{" "}
            {user?.name || "Administrator"} 🛡️
          </h1>

          <p>
            Manage volunteers, requesters,
            and emergency support users.
          </p>

        </div>


        {/* ===================================================
            MESSAGES
        =================================================== */}

        {error && (
          <div className="dashboard-message error-message">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="dashboard-message success-message">
            ✅ {message}
          </div>
        )}


        {/* ===================================================
            STATS
        =================================================== */}

        <div className="admin-stat-grid">

          <div className="admin-stat">

            <span>👥</span>

            <small>
              TOTAL REQUESTERS
            </small>

            <strong>
              {totalRequesters}
            </strong>

          </div>


          <div className="admin-stat">

            <span>🤝</span>

            <small>
              TOTAL VOLUNTEERS
            </small>

            <strong>
              {totalVolunteers}
            </strong>

          </div>


          <div className="admin-stat">

            <span>⏳</span>

            <small>
              PENDING VERIFICATION
            </small>

            <strong>
              {pendingVolunteers}
            </strong>

          </div>


          <div className="admin-stat">

            <span>✅</span>

            <small>
              VERIFIED VOLUNTEERS
            </small>

            <strong>
              {verifiedVolunteers}
            </strong>

          </div>


          <div className="admin-stat">

            <span>❌</span>

            <small>
              REJECTED VOLUNTEERS
            </small>

            <strong>
              {rejectedVolunteers}
            </strong>

          </div>

        </div>


        {/* ===================================================
            ALL REQUESTERS
        =================================================== */}

        <section className="admin-volunteer-section">

          <div className="admin-section-header">

            <div>

              <span>
                REQUESTER MANAGEMENT
              </span>

              <h2>
                All Requesters
              </h2>

              <p>
                View all registered users who
                can create emergency requests.
              </p>

            </div>

            <button
              className="admin-refresh-btn"
              onClick={loadAdminData}
              disabled={
                loading ||
                usersLoading
              }
            >
              🔄{" "}
              {loading || usersLoading
                ? "LOADING..."
                : "REFRESH"}
            </button>

          </div>


          {/* REQUESTER LOADING */}

          {usersLoading && (
            <div className="admin-empty-state">

              <div>🔄</div>

              <h3>
                Loading requesters...
              </h3>

              <p>
                Please wait while requester
                records are loaded.
              </p>

            </div>
          )}


          {/* NO REQUESTERS */}

          {!usersLoading &&
            requesters.length === 0 && (
              <div className="admin-empty-state">

                <div>👥</div>

                <h3>
                  No Requesters Registered
                </h3>

                <p>
                  Registered requesters will
                  appear here.
                </p>

              </div>
            )}


          {/* REQUESTER LIST */}

          {!usersLoading &&
            requesters.length > 0 && (
              <div className="admin-volunteer-list">

                {requesters.map(
                  (requester) => (

                    <div
                      className="admin-volunteer-card"
                      key={requester._id}
                    >

                      {/* HEADER */}

                      <div className="admin-volunteer-top">

                        <div className="admin-volunteer-avatar">

                          {requester.name
                            ? requester.name
                                .charAt(0)
                                .toUpperCase()
                            : "R"}

                        </div>


                        <div className="admin-volunteer-name">

                          <h3>
                            {requester.name ||
                              "Requester"}
                          </h3>

                          <p>
                            {requester.email ||
                              "-"}
                          </p>

                        </div>


                        <span
                          className="admin-verification-status verified"
                        >
                          REQUESTER
                        </span>

                      </div>


                      {/* DETAILS */}

                      <div className="admin-volunteer-details">

                        <div>

                          <small>
                            PHONE
                          </small>

                          <strong>
                            {requester.phone ||
                              "-"}
                          </strong>

                        </div>


                        <div>

                          <small>
                            ROLE
                          </small>

                          <strong>
                            Requester
                          </strong>

                        </div>


                        <div>

                          <small>
                            ACCOUNT
                          </small>

                          <strong>
                            {requester.isBlocked
                              ? "🚫 Blocked"
                              : "🟢 Active"}
                          </strong>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

        </section>


        {/* ===================================================
            VOLUNTEER MANAGEMENT
        =================================================== */}

        <section className="admin-volunteer-section">

          <div className="admin-section-header">

            <div>

              <span>
                VOLUNTEER MANAGEMENT
              </span>

              <h2>
                All Volunteers
              </h2>

              <p>
                Review registered volunteers
                and verify emergency helpers.
              </p>

            </div>

            <button
              className="admin-refresh-btn"
              onClick={loadAdminData}
              disabled={loading}
            >
              🔄{" "}
              {loading
                ? "LOADING..."
                : "REFRESH"}
            </button>

          </div>


          {/* VOLUNTEER LOADING */}

          {loading && (
            <div className="admin-empty-state">

              <div>🔄</div>

              <h3>
                Loading volunteers...
              </h3>

              <p>
                Please wait while volunteer
                records are loaded.
              </p>

            </div>
          )}


          {/* NO VOLUNTEERS */}

          {!loading &&
            volunteers.length === 0 && (
              <div className="admin-empty-state">

                <div>🤝</div>

                <h3>
                  No Volunteers Registered
                </h3>

                <p>
                  Registered volunteers will
                  appear here.
                </p>

              </div>
            )}


          {/* VOLUNTEERS */}

          {!loading &&
            volunteers.length > 0 && (
              <div className="admin-volunteer-list">

                {volunteers.map(
                  (volunteer) => (

                    <div
                      className="admin-volunteer-card"
                      key={volunteer._id}
                    >

                      {/* CARD HEADER */}

                      <div className="admin-volunteer-top">

                        <div className="admin-volunteer-avatar">

                          {volunteer.userId?.name
                            ? volunteer.userId.name
                                .charAt(0)
                                .toUpperCase()
                            : "V"}

                        </div>


                        <div className="admin-volunteer-name">

                          <h3>
                            {volunteer.userId?.name ||
                              "Volunteer"}
                          </h3>

                          <p>
                            {volunteer.userId?.email ||
                              "-"}
                          </p>

                        </div>


                        <span
                          className={`admin-verification-status ${volunteer.verificationStatus}`}
                        >

                          {volunteer.verificationStatus ===
                            "verified" &&
                            "✓ VERIFIED"}

                          {volunteer.verificationStatus ===
                            "pending" &&
                            "⏳ PENDING"}

                          {volunteer.verificationStatus ===
                            "rejected" &&
                            "✕ REJECTED"}

                        </span>

                      </div>


                      {/* BASIC DETAILS */}

                      <div className="admin-volunteer-details">

                        <div>

                          <small>
                            PHONE
                          </small>

                          <strong>
                            {volunteer.userId?.phone ||
                              "-"}
                          </strong>

                        </div>


                        <div>

                          <small>
                            BLOOD GROUP
                          </small>

                          <strong>
                            {volunteer.bloodGroup ||
                              "-"}
                          </strong>

                        </div>


                        <div>

                          <small>
                            LOCATION
                          </small>

                          <strong>
                            {volunteer.location ||
                              "-"}
                          </strong>

                        </div>


                        <div>

                          <small>
                            AVAILABILITY
                          </small>

                          <strong>
                            {volunteer.availability
                              ? "🟢 Available"
                              : "⚪ Offline"}
                          </strong>

                        </div>

                      </div>


                      {/* SKILLS */}

                      <div className="admin-volunteer-tags">

                        <small>
                          SKILLS
                        </small>

                        <div>

                          {volunteer.skills?.length >
                          0 ? (
                            volunteer.skills.map(
                              (skill) => (
                                <span
                                  key={skill}
                                >
                                  {skill}
                                </span>
                              )
                            )
                          ) : (
                            <span>
                              No skills
                            </span>
                          )}

                        </div>

                      </div>


                      {/* EMERGENCY TYPES */}

                      <div className="admin-volunteer-tags">

                        <small>
                          EMERGENCY TYPES
                        </small>

                        <div>

                          {volunteer.emergencyTypes
                            ?.length > 0 ? (
                            volunteer.emergencyTypes.map(
                              (type) => (
                                <span
                                  key={type}
                                >
                                  {type}
                                </span>
                              )
                            )
                          ) : (
                            <span>
                              No emergency types
                            </span>
                          )}

                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div className="admin-volunteer-actions">

                        {volunteer.verificationStatus !==
                          "verified" && (

                          <button
                            className="admin-verify-btn"
                            onClick={() =>
                              verifyVolunteer(
                                volunteer._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              volunteer._id
                            }
                          >

                            {actionLoading ===
                            volunteer._id
                              ? "UPDATING..."
                              : "✓ VERIFY"}

                          </button>

                        )}


                        {volunteer.verificationStatus !==
                          "rejected" && (

                          <button
                            className="admin-reject-btn"
                            onClick={() =>
                              rejectVolunteer(
                                volunteer._id
                              )
                            }
                            disabled={
                              actionLoading ===
                              volunteer._id
                            }
                          >

                            {actionLoading ===
                            volunteer._id
                              ? "UPDATING..."
                              : "✕ REJECT"}

                          </button>

                        )}

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;