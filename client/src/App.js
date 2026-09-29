import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import RequesterDashboard from "./pages/RequesterDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  return (
    <div className="app">

      <nav className="navbar">

        <div className="logo">

          <span>EVN</span>

          <div>
            <h2>Emergency Volunteer Network</h2>
            <p>Help when it matters most</p>
          </div>

        </div>

        <div className="nav-links">

          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#emergencies">Emergencies</a>

          <a
            href="/login"
            className="login-btn"
          >
            Login
          </a>

          <a
            href="/signup"
            className="signup-nav-btn"
          >
            Join EVN
          </a>

        </div>

      </nav>

      <main>

        <section className="hero" id="home">

          <div className="hero-content">

            <div className="emergency-badge">
              🚨 Emergency Volunteer Network
            </div>

            <h1>
              When every second matters,
              <span>
                help should be closer than you think.
              </span>
            </h1>

            <p>
              EVN connects people who need emergency
              assistance with registered volunteers who
              are ready and available to help.
            </p>

            <div className="hero-buttons">

              <a
                href="/login"
                className="primary-btn hero-link"
              >
                🚨 Request Help
              </a>

              <a
                href="/signup"
                className="secondary-btn hero-link"
              >
                🤝 Become a Volunteer
              </a>

            </div>

          </div>

          <div className="hero-card">

            <div className="pulse-circle">
              🚑
            </div>

            <h3>Emergency Support</h3>

            <p>
              Connecting people with available
              volunteers for faster assistance.
            </p>

            <div className="status">
              <span></span>
              Volunteers Online
            </div>

          </div>

        </section>

        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="section-heading">

            <span>HOW IT WORKS</span>

            <h2>
              Help is only a few steps away
            </h2>

            <p>
              EVN makes emergency volunteer
              coordination simple and fast.
            </p>

          </div>

          <div className="steps">

            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">🚨</div>
              <h3>Request Help</h3>
              <p>
                Create an emergency request with the
                required information.
              </p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">🔎</div>
              <h3>Find Volunteers</h3>
              <p>
                EVN searches for suitable available
                volunteers.
              </p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">🤝</div>
              <h3>Volunteer Accepts</h3>
              <p>
                A suitable volunteer accepts the
                emergency request.
              </p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">❤️</div>
              <h3>Get Assistance</h3>
              <p>
                The volunteer provides the required
                assistance.
              </p>
            </div>

          </div>

        </section>

        <section
          className="emergency-section"
          id="emergencies"
        >

          <div className="section-heading">

            <span>EMERGENCY SUPPORT</span>

            <h2>
              Help for different emergency situations
            </h2>

            <p>
              EVN can coordinate volunteers for a
              variety of emergency needs.
            </p>

          </div>

          <div className="emergency-grid">

            {[
              ["🩸", "Blood Donation"],
              ["🏥", "Medical Assistance"],
              ["🩹", "First Aid"],
              ["🚑", "Emergency Transport"],
              ["💧", "Food & Water"],
              ["🌪️", "Disaster Assistance"],
              ["👴", "Elderly Assistance"],
              ["♿", "Disability Assistance"],
              ["🔍", "Missing Person"],
              ["🆘", "Other Emergency"]
            ].map(([icon, title]) => (
              <div
                className="emergency-card"
                key={title}
              >
                <div>{icon}</div>

                <h3>{title}</h3>

                <p>
                  Find suitable volunteers who can
                  provide assistance.
                </p>
              </div>
            ))}

          </div>

        </section>

        <section className="cta-section">

          <div>

            <h2>
              Ready to make a difference?
            </h2>

            <p>
              One volunteer can make a huge difference
              when someone needs help.
            </p>

          </div>

          <a
            href="/signup"
            className="primary-btn hero-link"
          >
            🤝 Become a Volunteer
          </a>

        </section>

      </main>

      <footer>

        <div>
          <h2>EVN</h2>
          <p>
            Emergency Volunteer Network
          </p>
        </div>

        <div>
          <p>
            This platform is a college project for
            volunteer coordination.
          </p>

          <p>
            For life-threatening emergencies, contact
            the appropriate official emergency service
            immediately.
          </p>
        </div>

        <div className="copyright">
          © 2026 Emergency Volunteer Network
        </div>

      </footer>

    </div>
  );
}

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({
  children,
  allowedRole
}) {
  const storedUser =
    localStorage.getItem("evnUser");

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(storedUser);

    if (
      allowedRole &&
      user.role !== allowedRole
    ) {
      if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
      }

      if (user.role === "volunteer") {
        return (
          <Navigate
            to="/volunteer"
            replace
          />
        );
      }

      return (
        <Navigate
          to="/requester"
          replace
        />
      );
    }

    return children;
  } catch (error) {
    localStorage.removeItem("evnUser");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/requester"
          element={
            <ProtectedRoute
              allowedRole="requester"
            >
              <RequesterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteer"
          element={
            <ProtectedRoute
              allowedRole="volunteer"
            >
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;