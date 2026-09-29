const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Volunteer = require("../models/Volunteer");

const router = express.Router();

/* =========================================================
   REGISTER
========================================================= */

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            role,
            bloodGroup,
            skills,
            emergencyTypes,
            location,
            latitude,
            longitude
        } = req.body;

        /* =========================
           BASIC VALIDATION
        ========================= */

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (!["requester", "volunteer"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration role"
            });
        }

        if (!/^[0-9]{10}$/.test(phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Phone number must contain exactly 10 digits"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        /* =========================
           VOLUNTEER VALIDATION
        ========================= */

        if (role === "volunteer") {

            const validBloodGroups = [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-"
            ];

            if (!validBloodGroups.includes(bloodGroup)) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a valid blood group"
                });
            }

            if (!Array.isArray(skills) || skills.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please select at least one skill"
                });
            }

            if (
                !Array.isArray(emergencyTypes) ||
                emergencyTypes.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please select at least one emergency type"
                });
            }

            if (!location || !location.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter your general location"
                });
            }
        }

        /* =========================
           CHECK DUPLICATE EMAIL
        ========================= */

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists"
            });
        }

        /* =========================
           HASH PASSWORD
        ========================= */

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        /* =========================
           CREATE USER
        ========================= */

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: hashedPassword,
            role,
            isBlocked: false
        });

        /* =========================
           CREATE VOLUNTEER PROFILE
        ========================= */

        if (role === "volunteer") {

            await Volunteer.create({
                userId: user._id,

                bloodGroup,

                skills,

                emergencyTypes,

                location: location.trim(),

                latitude:
                    latitude !== "" &&
                    latitude !== undefined
                        ? Number(latitude)
                        : null,

                longitude:
                    longitude !== "" &&
                    longitude !== undefined
                        ? Number(longitude)
                        : null,

                availability: false,

                verificationStatus: "pending",

                rating: 0,

                totalHelps: 0
            });
        }

        /* =========================
           RESPONSE
        ========================= */

        return res.status(201).json({
            success: true,

            message:
                role === "volunteer"
                    ? "Registration successful. Your volunteer account is waiting for verification."
                    : "Registration successful.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error during registration"
        });
    }
});



/* =========================================================
   GET ALL REQUESTERS AND VOLUNTEERS
   GET /api/auth/users
========================================================= */

router.get("/users", async (req, res) => {
    try {
        const users = await User.find({
            role: {
                $in: ["requester", "volunteer"]
            }
        })
            .select(
                "name email phone role profileImage isBlocked createdAt"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            users
        });

    } catch (error) {

        console.error(
            "Get all users error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching users"
        });
    }
});


/* =========================================================
   LOGIN
========================================================= */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        /* =========================
           VALIDATION
        ========================= */

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        /* =========================
           FIND USER
        ========================= */

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        /* =========================
           BLOCK CHECK
        ========================= */

        if (user.isBlocked) {

            return res.status(403).json({
                success: false,
                message:
                    "Your account has been blocked by the administrator"
            });
        }

        /* =========================
           PASSWORD CHECK
        ========================= */

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        /* =========================
           VOLUNTEER PROFILE
        ========================= */

        let volunteerProfile = null;

        if (user.role === "volunteer") {

            volunteerProfile =
                await Volunteer.findOne({
                    userId: user._id
                });
        }

        /* =========================
           RESPONSE
        ========================= */

        return res.status(200).json({

            success: true,

            message: "Login successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },

            volunteer:
                volunteerProfile
                    ? {
                        id: volunteerProfile._id,
                        bloodGroup:
                            volunteerProfile.bloodGroup,
                        skills:
                            volunteerProfile.skills,
                        emergencyTypes:
                            volunteerProfile.emergencyTypes,
                        location:
                            volunteerProfile.location,
                        latitude:
                            volunteerProfile.latitude,
                        longitude:
                            volunteerProfile.longitude,
                        availability:
                            volunteerProfile.availability,
                        verificationStatus:
                            volunteerProfile.verificationStatus,
                        rating:
                            volunteerProfile.rating,
                        totalHelps:
                            volunteerProfile.totalHelps
                    }
                    : null
        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error during login"
        });
    }
});
module.exports = router;