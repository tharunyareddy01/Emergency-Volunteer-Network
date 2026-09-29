const express = require("express");

const Volunteer = require("../models/Volunteer");

const router = express.Router();

/* =========================================================
   GET VOLUNTEER PROFILE
   GET /api/volunteers/profile/:userId
========================================================= */

router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const volunteer = await Volunteer.findOne({
      userId
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found"
      });
    }

    res.status(200).json({
      success: true,
      volunteer: {
        id: volunteer._id,
        userId: volunteer.userId,
        bloodGroup: volunteer.bloodGroup,
        skills: volunteer.skills,
        emergencyTypes: volunteer.emergencyTypes,
        latitude: volunteer.latitude,
        longitude: volunteer.longitude,
        location: volunteer.location,
        availability: volunteer.availability,
        verificationStatus:
          volunteer.verificationStatus,
        rating: volunteer.rating,
        totalHelps: volunteer.totalHelps
      }
    });

  } catch (error) {
    console.error(
      "Get volunteer profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching volunteer profile"
    });
  }
});


/* =========================================================
   GET ALL VOLUNTEERS
   GET /api/volunteers
========================================================= */

router.get("/", async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate(
        "userId",
        "name email phone isBlocked"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      volunteers
    });

  } catch (error) {
    console.error(
      "Get all volunteers error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching volunteers"
    });
  }
});


/* =========================================================
   VERIFY VOLUNTEER
   PUT /api/volunteers/verify/:volunteerId
========================================================= */

router.put(
  "/verify/:volunteerId",
  async (req, res) => {
    try {
      const { volunteerId } = req.params;

      const volunteer =
        await Volunteer.findById(volunteerId);

      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message: "Volunteer profile not found"
        });
      }

      volunteer.verificationStatus = "verified";

      await volunteer.save();

      res.status(200).json({
        success: true,
        message:
          "Volunteer verified successfully",
        volunteer
      });

    } catch (error) {
      console.error(
        "Verify volunteer error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while verifying volunteer"
      });
    }
  }
);


/* =========================================================
   REJECT VOLUNTEER
   PUT /api/volunteers/reject/:volunteerId
========================================================= */

router.put(
  "/reject/:volunteerId",
  async (req, res) => {
    try {
      const { volunteerId } = req.params;

      const volunteer =
        await Volunteer.findById(volunteerId);

      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message: "Volunteer profile not found"
        });
      }

      volunteer.verificationStatus = "rejected";
      volunteer.availability = false;

      await volunteer.save();

      res.status(200).json({
        success: true,
        message:
          "Volunteer rejected successfully",
        volunteer
      });

    } catch (error) {
      console.error(
        "Reject volunteer error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while rejecting volunteer"
      });
    }
  }
);


/* =========================================================
   UPDATE VOLUNTEER AVAILABILITY
   PUT /api/volunteers/availability/:volunteerId
========================================================= */

router.put(
  "/availability/:volunteerId",
  async (req, res) => {
    try {
      const { volunteerId } = req.params;
      const { availability } = req.body;

      if (typeof availability !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "Availability must be true or false"
        });
      }

      const volunteer =
        await Volunteer.findById(volunteerId);

      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message:
            "Volunteer profile not found"
        });
      }

      /* =========================
         ADMIN VERIFICATION CHECK
      ========================= */

      if (
        volunteer.verificationStatus !==
        "verified"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your volunteer account must be verified before changing availability"
        });
      }

      volunteer.availability = availability;

      await volunteer.save();

      res.status(200).json({
        success: true,
        message: availability
          ? "You are now available for emergencies"
          : "You are now unavailable",

        volunteer: {
          id: volunteer._id,
          userId: volunteer.userId,
          bloodGroup: volunteer.bloodGroup,
          skills: volunteer.skills,
          emergencyTypes:
            volunteer.emergencyTypes,
          latitude: volunteer.latitude,
          longitude: volunteer.longitude,
          location: volunteer.location,
          availability:
            volunteer.availability,
          verificationStatus:
            volunteer.verificationStatus,
          rating: volunteer.rating,
          totalHelps:
            volunteer.totalHelps
        }
      });

    } catch (error) {
      console.error(
        "Availability update error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while updating availability"
      });
    }
  }
);


module.exports = router;