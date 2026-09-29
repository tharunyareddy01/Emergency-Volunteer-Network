const express = require("express");

const Message = require("../models/Message");
const Emergency = require("../models/Emergency");
const User = require("../models/User");
const Notification = require("../models/Notification");

const router = express.Router();

/* =========================================================
   GET CHAT MESSAGES
   GET /api/messages/:emergencyId
========================================================= */

router.get("/:emergencyId", async (req, res) => {
    try {
        const { emergencyId } = req.params;

        const emergency = await Emergency.findById(emergencyId);

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
            });
        }

        const messages = await Message.find({
            emergencyId
        })
            .populate("senderId", "name role")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages"
        });
    }
});


/* =========================================================
   SEND CHAT MESSAGE
   POST /api/messages/:emergencyId
========================================================= */

router.post("/:emergencyId", async (req, res) => {
    try {
        const { emergencyId } = req.params;
        const { senderId, message } = req.body;

        if (!senderId || !message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Sender ID and message are required"
            });
        }

        const emergency = await Emergency.findById(emergencyId);

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency not found"
            });
        }

        /* =========================
           CHECK SENDER
        ========================= */

        const sender = await User.findById(senderId);

        if (!sender) {
            return res.status(404).json({
                success: false,
                message: "Sender not found"
            });
        }

        if (
            sender._id.toString() !==
                emergency.requesterId.toString()
        ) {
            const volunteer =
                emergency.assignedVolunteerId;

            if (
                !volunteer ||
                sender.role !== "volunteer"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not allowed to chat for this emergency"
                });
            }

            const volunteerProfile =
                await require("../models/Volunteer")
                    .findOne({
                        userId: senderId
                    });

            if (
                !volunteerProfile ||
                volunteerProfile._id.toString() !==
                    volunteer.toString()
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not the assigned volunteer"
                });
            }
        }

        /* =========================
           ALLOW CHAT ONLY AFTER ASSIGNMENT
        ========================= */

        if (
            !emergency.assignedVolunteerId ||
            emergency.status === "Searching" ||
            emergency.status === "Cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Chat is available only after a volunteer is assigned"
            });
        }

        if (emergency.status === "Completed") {
            return res.status(400).json({
                success: false,
                message:
                    "Chat is closed because the emergency is completed"
            });
        }

        /* =========================
           CREATE MESSAGE
        ========================= */

        const newMessage = await Message.create({
            emergencyId,
            senderId,
            senderRole: sender.role,
            message: message.trim()
        });

        /* =========================
           FIND RECEIVER
        ========================= */

        let receiverId;

        if (
            sender._id.toString() ===
            emergency.requesterId.toString()
        ) {
            const volunteerProfile =
                await require("../models/Volunteer")
                    .findById(
                        emergency.assignedVolunteerId
                    );

            if (volunteerProfile) {
                receiverId =
                    volunteerProfile.userId;
            }
        } else {
            receiverId =
                emergency.requesterId;
        }

        /* =========================
           NOTIFY RECEIVER
        ========================= */

        if (receiverId) {
            await Notification.create({
                userId: receiverId,
                title: "New Chat Message",
                message:
                    `${sender.name} sent you a message.`,
                type: "message",
                relatedEmergencyId: emergency._id,
                isRead: false
            });
        }

        const populatedMessage =
            await Message.findById(
                newMessage._id
            ).populate(
                "senderId",
                "name role"
            );

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            chatMessage: populatedMessage
        });

    } catch (error) {
        console.error("Send message error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
});


module.exports = router;