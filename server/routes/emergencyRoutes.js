const express = require("express");

const Emergency = require("../models/Emergency");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Notification = require("../models/Notification");

const router = express.Router();

/* =========================================================
   CREATE EMERGENCY
   POST /api/emergencies
========================================================= */

router.post("/", async (req, res) => {
    try {
        const {
            requesterId,
            type,
            description,
            priority,
            bloodGroup,
            requiredSkill,
            location,
            latitude,
            longitude,
            phoneNumber
        } = req.body;

        /* =========================
           VALIDATION
        ========================= */

        if (
            !requesterId ||
            !type ||
            !description ||
            !priority ||
            !location
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required emergency details"
            });
        }

        /* =========================
           CHECK REQUESTER
        ========================= */

        const requester = await User.findById(requesterId);

        if (!requester) {
            return res.status(404).json({
                success: false,
                message: "Requester not found"
            });
        }

        if (requester.role !== "requester") {
            return res.status(403).json({
                success: false,
                message:
                    "Only requesters can create emergencies"
            });
        }

        if (requester.isBlocked) {
            return res.status(403).json({
                success: false,
                message:
                    "Blocked users cannot create emergencies"
            });
        }

        /* =========================
           CREATE EMERGENCY
        ========================= */

        const emergency = await Emergency.create({
            requesterId,

            type,

            description: description.trim(),

            priority,

            bloodGroup: bloodGroup || "",

            requiredSkill: requiredSkill || "",

            location: location.trim(),

            latitude:
                latitude !== "" &&
                latitude !== undefined &&
                latitude !== null
                    ? Number(latitude)
                    : null,

            longitude:
                longitude !== "" &&
                longitude !== undefined &&
                longitude !== null
                    ? Number(longitude)
                    : null,

            phoneNumber:
                phoneNumber || requester.phone,

            status: "Searching",

            assignedVolunteerId: null
        });

        /* =========================
           FIND AVAILABLE VOLUNTEERS
        ========================= */

        const volunteers =
            await Volunteer.find({
                availability: true,
                verificationStatus: "verified"
            });

        /* =========================
           FIND SUITABLE VOLUNTEERS
        ========================= */

        const suitableVolunteers =
            volunteers.filter((volunteer) => {

                const emergencyTypeMatch =
                    volunteer.emergencyTypes &&
                    volunteer.emergencyTypes.includes(type);

                const skillMatch =
                    !requiredSkill ||
                    (
                        volunteer.skills &&
                        volunteer.skills.includes(
                            requiredSkill
                        )
                    );

                const bloodMatch =
                    !bloodGroup ||
                    volunteer.bloodGroup === bloodGroup;

                return (
                    emergencyTypeMatch &&
                    skillMatch &&
                    bloodMatch
                );
            });

        /* =========================
           NOTIFY SUITABLE VOLUNTEERS
        ========================= */

        for (
            const volunteer of suitableVolunteers
        ) {

            await Notification.create({

                userId: volunteer.userId,

                type: "emergency",

                title: "New Emergency Request",

                message:
                    `${priority} priority ${type} emergency ` +
                    `needs assistance at ${location}`,

                relatedEmergencyId:
                    emergency._id,

                isRead: false
            });
        }

        /* =========================
           RESPONSE
        ========================= */

        return res.status(201).json({

            success: true,

            message:
                "Emergency request created successfully",

            emergency,

            notifiedVolunteers:
                suitableVolunteers.length
        });

    } catch (error) {

        console.error(
            "Create emergency error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while creating emergency"
        });
    }
});


/* =========================================================
   GET REQUESTER EMERGENCIES
   GET /api/emergencies/requester/:requesterId
========================================================= */

router.get(
    "/requester/:requesterId",
    async (req, res) => {

        try {

            const emergencies =
                await Emergency.find({
                    requesterId:
                        req.params.requesterId
                })
                .populate(
                    "assignedVolunteerId"
                )
                .sort({
                    createdAt: -1
                });

            return res.status(200).json({

                success: true,

                emergencies

            });

        } catch (error) {

            console.error(
                "Get requester emergencies error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching emergencies"
            });
        }
    }
);


/* =========================================================
   GET AVAILABLE EMERGENCIES
   GET /api/emergencies/available
========================================================= */

router.get(
    "/available",
    async (req, res) => {

        try {

            const emergencies =
                await Emergency.find({
                    status: "Searching"
                })
                .populate(
                    "requesterId",
                    "name phone"
                )
                .sort({
                    createdAt: -1
                });

            return res.status(200).json({

                success: true,

                emergencies

            });

        } catch (error) {

            console.error(
                "Get available emergencies error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching available emergencies"
            });
        }
    }
);


/* =========================================================
   GET VOLUNTEER EMERGENCIES
   GET /api/emergencies/volunteer/:volunteerId
========================================================= */

router.get(
    "/volunteer/:volunteerId",
    async (req, res) => {

        try {

            const volunteer =
                await Volunteer.findById(
                    req.params.volunteerId
                );

            if (!volunteer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Volunteer not found"
                });
            }

            const emergencies =
                await Emergency.find({

                    status: {
                        $in: [
                            "Searching",
                            "Volunteer Assigned",
                            "Accepted",
                            "On the Way",
                            "Help In Progress"
                        ]
                    }

                })
                .populate(
                    "requesterId",
                    "name email phone"
                )
                .sort({
                    createdAt: -1
                });

            const suitableEmergencies =
                emergencies.filter(
                    (emergency) => {

                        if (
                            emergency.assignedVolunteerId &&
                            emergency.assignedVolunteerId.toString()
                                !== volunteer._id.toString()
                        ) {
                            return false;
                        }

                        const emergencyTypeMatch =
                            volunteer.emergencyTypes &&
                            volunteer.emergencyTypes.includes(
                                emergency.type
                            );

                        const skillMatch =
                            !emergency.requiredSkill ||
                            (
                                volunteer.skills &&
                                volunteer.skills.includes(
                                    emergency.requiredSkill
                                )
                            );

                        const bloodMatch =
                            !emergency.bloodGroup ||
                            volunteer.bloodGroup ===
                                emergency.bloodGroup;

                        return (
                            emergencyTypeMatch &&
                            skillMatch &&
                            bloodMatch
                        );
                    }
                );

            return res.status(200).json({

                success: true,

                emergencies:
                    suitableEmergencies

            });

        } catch (error) {

            console.error(
                "Get volunteer emergencies error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching volunteer emergencies"
            });
        }
    }
);


/* =========================================================
   ACCEPT EMERGENCY
   PUT /api/emergencies/:id/accept
========================================================= */

router.put(
    "/:id/accept",
    async (req, res) => {

        try {

            const {
                volunteerId
            } = req.body;

            if (!volunteerId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Volunteer ID is required"
                });
            }

            const volunteer =
                await Volunteer.findById(
                    volunteerId
                );

            if (!volunteer) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Volunteer not found"
                });
            }

            if (
                volunteer.verificationStatus !==
                "verified"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Volunteer is not verified"
                });
            }

            const emergency =
                await Emergency.findById(
                    req.params.id
                );

            if (!emergency) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Emergency not found"
                });
            }

            if (
                emergency.status !==
                "Searching"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This emergency is no longer available"
                });
            }

            /* =========================
               ASSIGN VOLUNTEER
            ========================= */

            emergency.assignedVolunteerId =
                volunteer._id;

            emergency.status =
                "Accepted";

            await emergency.save();

            /* =========================
               NOTIFY REQUESTER
            ========================= */

            await Notification.create({

                userId:
                    emergency.requesterId,

                type: "assignment",

                title:
                    "Volunteer Accepted Your Emergency",

                message:
                    "A verified volunteer has accepted " +
                    "your emergency request.",

                relatedEmergencyId:
                    emergency._id,

                isRead: false
            });

            /* =========================
               NOTIFY VOLUNTEER
            ========================= */

            await Notification.create({

                userId:
                    volunteer.userId,

                type: "assignment",

                title:
                    "Emergency Accepted",

                message:
                    "You have successfully accepted " +
                    "the emergency request.",

                relatedEmergencyId:
                    emergency._id,

                isRead: false
            });

            const updatedEmergency =
                await Emergency.findById(
                    emergency._id
                )
                .populate(
                    "requesterId",
                    "name email phone"
                )
                .populate(
                    "assignedVolunteerId"
                );

            return res.status(200).json({

                success: true,

                message:
                    "Emergency accepted successfully",

                emergency:
                    updatedEmergency
            });

        } catch (error) {

            console.error(
                "Accept emergency error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while accepting emergency"
            });
        }
    }
);


/* =========================================================
   UPDATE EMERGENCY STATUS
   PUT /api/emergencies/:id/status
========================================================= */

router.put(
    "/:id/status",
    async (req, res) => {

        try {

            const {
                volunteerId,
                status
            } = req.body;

            const allowedStatuses = [
                "Accepted",
                "On the Way",
                "Help In Progress",
                "Completed"
            ];

            if (!volunteerId || !status) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Volunteer ID and status are required"
                });
            }

            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid emergency status"
                });
            }

            const emergency =
                await Emergency.findById(
                    req.params.id
                );

            if (!emergency) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Emergency not found"
                });
            }

            if (
                !emergency.assignedVolunteerId
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No volunteer is assigned to this emergency"
                });
            }

            if (
                emergency.assignedVolunteerId.toString()
                    !== volunteerId.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not assigned to this emergency"
                });
            }

            emergency.status = status;

            if (status === "Completed") {

                emergency.completedAt =
                    new Date();

            }

            await emergency.save();

            /* =========================
               UPDATE VOLUNTEER HELP COUNT
            ========================= */

            if (status === "Completed") {

                const volunteer =
                    await Volunteer.findById(
                        volunteerId
                    );

                if (volunteer) {

                    volunteer.totalHelps =
                        (volunteer.totalHelps || 0) + 1;

                    volunteer.availability =
                        false;

                    await volunteer.save();
                }
            }

            /* =========================
               REQUESTER NOTIFICATION
            ========================= */

            let notificationTitle =
                "Emergency Status Updated";

            let notificationMessage =
                `Your emergency status is now "${status}".`;

            if (status === "Accepted") {

                notificationTitle =
                    "Volunteer Accepted";

                notificationMessage =
                    "A volunteer has accepted your emergency request.";
            }

            if (status === "On the Way") {

                notificationTitle =
                    "Volunteer Is On The Way";

                notificationMessage =
                    "Your volunteer is on the way to your location.";
            }

            if (status === "Help In Progress") {

                notificationTitle =
                    "Help Is In Progress";

                notificationMessage =
                    "The volunteer has started helping you.";
            }

            if (status === "Completed") {

                notificationTitle =
                    "Emergency Completed";

                notificationMessage =
                    "Your emergency request has been completed. Thank you.";
            }

            await Notification.create({

                userId:
                    emergency.requesterId,

                type: "status",

                title:
                    notificationTitle,

                message:
                    notificationMessage,

                relatedEmergencyId:
                    emergency._id,

                isRead: false
            });

            /* =========================
               VOLUNTEER NOTIFICATION
            ========================= */

            const volunteer =
                await Volunteer.findById(
                    volunteerId
                );

            if (volunteer) {

                await Notification.create({

                    userId:
                        volunteer.userId,

                    type: "status",

                    title:
                        "Emergency Status Updated",

                    message:
                        `Emergency status changed to "${status}".`,

                    relatedEmergencyId:
                        emergency._id,

                    isRead: false
                });
            }

            const updatedEmergency =
                await Emergency.findById(
                    emergency._id
                )
                .populate(
                    "requesterId",
                    "name email phone"
                )
                .populate(
                    "assignedVolunteerId"
                );

            return res.status(200).json({

                success: true,

                message:
                    "Emergency status updated successfully",

                emergency:
                    updatedEmergency
            });

        } catch (error) {

            console.error(
                "Update emergency status error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while updating emergency status"
            });
        }
    }
);


/* =========================================================
   GET SINGLE EMERGENCY
   GET /api/emergencies/:id
========================================================= */

router.get(
    "/:id",
    async (req, res) => {

        try {

            const emergency =
                await Emergency.findById(
                    req.params.id
                )
                .populate(
                    "requesterId",
                    "name email phone"
                )
                .populate(
                    "assignedVolunteerId"
                );

            if (!emergency) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Emergency not found"
                });
            }

            return res.status(200).json({

                success: true,

                emergency

            });

        } catch (error) {

            console.error(
                "Get emergency error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Server error while fetching emergency"
            });
        }
    }
);


/* =========================================================
   CANCEL EMERGENCY
   PATCH /api/emergencies/:id/cancel
   PUT   /api/emergencies/:id/cancel
========================================================= */

const cancelEmergency = async (req, res) => {

    try {

        const emergency =
            await Emergency.findById(
                req.params.id
            );

        if (!emergency) {

            return res.status(404).json({

                success: false,

                message:
                    "Emergency not found"
            });
        }

        if (
            emergency.status ===
            "Completed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Completed emergencies cannot be cancelled"
            });
        }

        if (
            emergency.status ===
            "Cancelled"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Emergency is already cancelled"
            });
        }

        /* =========================
           SAVE OLD ASSIGNED VOLUNTEER
        ========================= */

        const assignedVolunteerId =
            emergency.assignedVolunteerId;

        /* =========================
           CANCEL
        ========================= */

        emergency.status =
            "Cancelled";

        await emergency.save();

        /* =========================
           NOTIFY REQUESTER
        ========================= */

        await Notification.create({

            userId:
                emergency.requesterId,

            type: "status",

            title:
                "Emergency Cancelled",

            message:
                "Your emergency request has been cancelled.",

            relatedEmergencyId:
                emergency._id,

            isRead: false
        });

        /* =========================
           NOTIFY ASSIGNED VOLUNTEER
        ========================= */

        if (assignedVolunteerId) {

            const volunteer =
                await Volunteer.findById(
                    assignedVolunteerId
                );

            if (volunteer) {

                await Notification.create({

                    userId:
                        volunteer.userId,

                    type: "status",

                    title:
                        "Emergency Cancelled",

                    message:
                        "The requester has cancelled this emergency request.",

                    relatedEmergencyId:
                        emergency._id,

                    isRead: false
                });

                /* Make volunteer available again */

                volunteer.availability =
                    true;

                await volunteer.save();
            }
        }

        return res.status(200).json({

            success: true,

            message:
                "Emergency cancelled successfully",

            emergency

        });

    } catch (error) {

        console.error(
            "Cancel emergency error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while cancelling emergency"
        });
    }
};


/* PATCH VERSION */
router.patch(
    "/:id/cancel",
    cancelEmergency
);


/* PUT VERSION
   This also supports the RequesterDashboard code
*/
router.put(
    "/:id/cancel",
    cancelEmergency
);


module.exports = router;