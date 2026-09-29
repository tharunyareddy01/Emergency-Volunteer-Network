# 🚨 Emergency Volunteer Network (EVN)

> **"When every second matters, help should be closer than you think."**

Emergency Volunteer Network (EVN) is a full-stack web application designed to connect people who need emergency assistance with available volunteers.

The platform allows requesters to create emergency requests, volunteers to discover and accept suitable requests, and administrators to manage users and volunteer information.

---

## 📌 About the Project

During emergencies, finding nearby people who are willing and available to help can be difficult.

The **Emergency Volunteer Network** provides a centralized platform where:

* 👤 Requesters can raise emergency requests.
* 🤝 Volunteers can register and become available to help.
* 🚨 Volunteers can view and accept emergency requests.
* 📍 Location information can help connect requests with volunteers.
* 💬 Users can communicate through the platform.
* 🔔 Notifications keep users updated.
* 🛠️ Administrators can manage users and volunteers.

The project demonstrates how a modern full-stack application can be used to coordinate emergency assistance.

---

## ✨ Features

### 👤 Requester

* User registration and login
* Create emergency requests
* Provide emergency details
* Share location information
* View emergency request status
* Track accepted requests
* Communicate with volunteers
* Receive notifications

### 🤝 Volunteer

* Volunteer registration
* Volunteer profile
* Blood group information
* Skills and emergency types
* Location information
* Availability status
* View available emergency requests
* Accept emergency requests
* Track assigned emergencies
* Communicate with requesters
* Receive notifications

### 🛠️ Admin

* Admin login
* View registered users
* View volunteers
* View requesters
* Manage volunteer information
* Monitor emergency-related data

---

## 🧑‍💻 Technology Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript
* React Router
* Fetch API

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Other Technologies

* REST APIs
* Local Storage
* Browser Geolocation API
* CORS

---

## 🏗️ Project Architecture

```text
                    Emergency Volunteer Network
                              │
                ┌─────────────┴─────────────┐
                │                           │
             Frontend                    Backend
             React.js                Node.js + Express
                │                           │
                │        REST API            │
                └──────────────┬────────────┘
                               │
                            Mongoose
                               │
                               ▼
                           MongoDB
```

---

## 🔄 Application Flow

### Requester Flow

```text
Register / Login
       ↓
Requester Dashboard
       ↓
Create Emergency Request
       ↓
Emergency Stored in MongoDB
       ↓
Available Volunteers Can View Request
       ↓
Volunteer Accepts Request
       ↓
Requester Receives Update
       ↓
Communication / Assistance
```

### Volunteer Flow

```text
Register / Login
       ↓
Complete Volunteer Profile
       ↓
Set Availability
       ↓
View Emergency Requests
       ↓
Accept Suitable Emergency
       ↓
Assist Requester
       ↓
Update Status
```

### Admin Flow

```text
Admin Login
     ↓
Admin Dashboard
     ↓
View Users
     ↓
View Volunteers
     ↓
View Requesters
     ↓
Manage / Monitor Platform
```

---

## 📂 Project Structure

```text
Emergency-Volunteer-Network/
│
├── client/
│   │
│   ├── public/
│   │
│   └── src/
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   ├── RequesterDashboard.js
│       │   ├── VolunteerDashboard.js
│       │   └── AdminDashboard.js
│       │
│       ├── services/
│       │   └── api.js
│       │
│       ├── App.js
│       ├── App.css
│       └── index.js
│
├── server/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Volunteer.js
│   │   ├── Emergency.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   └── Feedback.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── volunteerRoutes.js
│   │   ├── emergencyRoutes.js
│   │   ├── messageRoutes.js
│   │   └── notificationRoutes.js
│   │
│   └── server.js
│
└── README.md
```

> The exact structure may vary depending on the current version of the project.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Emergency-Volunteer-Network.git
```

### 2. Open the project

```bash
cd Emergency-Volunteer-Network
```

---

## 📦 Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

Open another terminal:

```bash
cd client
npm install
```

---

## 🗄️ MongoDB Configuration

Make sure MongoDB is installed and running.

Create the required environment configuration for the backend.

Example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/emergency_volunteer_network
PORT=4000
```

Do **not** upload passwords, API keys, database credentials, or other secrets to GitHub.

---

## ▶️ Run the Application

### Start Backend

```bash
cd server
node server.js
```

Backend:

```text
http://localhost:4000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm start
```

Frontend:

```text
http://localhost:3000
```

---

## 🔐 User Roles

The application supports three main roles:

| Role         | Purpose                                   |
| ------------ | ----------------------------------------- |
| 👤 Requester | Creates and tracks emergency requests     |
| 🤝 Volunteer | Finds and accepts emergency requests      |
| 🛠️ Admin    | Manages and monitors users and volunteers |

---

## 🔌 API Communication

The React frontend communicates with the Express backend using REST APIs.

```text
React Frontend
      ↓
Fetch API
      ↓
Express Routes
      ↓
Controllers / Route Logic
      ↓
Mongoose
      ↓
MongoDB
```

---

## 🎯 Project Objectives

* Build a real-world full-stack web application.
* Connect emergency requesters with volunteers.
* Practice React.js frontend development.
* Build REST APIs using Node.js and Express.js.
* Store and manage data using MongoDB and Mongoose.
* Implement role-based application functionality.
* Work with location-based information.
* Understand frontend-backend communication.

---

## 🚀 Future Enhancements

Possible future improvements include:

* Real-time volunteer-request matching
* Interactive maps
* Advanced location-based volunteer matching
* Push notifications
* Emergency priority levels
* Volunteer verification
* Emergency request history
* Improved admin analytics
* Deployment to cloud platforms

---

## 👩‍💻 Developer

**Tharunya Reddy**

B.Tech – Computer Science and Engineering

GitHub: [@tharunyareddy01](https://github.com/tharunyareddy01)

---

## 📄 License

This project was developed as an academic/college project for learning and demonstrating full-stack web development.

---

⭐ **If you find this project useful, consider giving the repository a star!**
