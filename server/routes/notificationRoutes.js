const express = require("express");

const Notification = require("../models/Notification");
const User = require("../models/User");

const router = express.Router();

/* =========================================================
   GET USER NOTIFICATIONS
   GET /api/notifications/:userId
========================================================= */

router.get("/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {

      return res.status(404).json({
        message: "User not found."
      });

    }

    const notifications =
      await Notification.find({
        userId
      })
        .populate(
          "relatedEmergencyId",
          "type status priority"
        )
        .sort({
          createdAt: -1
        })
        .limit(50);

    const unreadCount =
      await Notification.countDocuments({
        userId,
        isRead: false
      });

    res.json({
      notifications,
      unreadCount
    });

  } catch (error) {

    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      message: "Unable to load notifications."
    });

  }

});


/* =========================================================
   MARK ONE NOTIFICATION AS READ
   PATCH /api/notifications/:notificationId/read
========================================================= */

router.patch(
  "/:notificationId/read",
  async (req, res) => {

    try {

      const notification =
        await Notification.findByIdAndUpdate(
          req.params.notificationId,
          {
            $set: {
              isRead: true
            }
          },
          {
            new: true
          }
        );

      if (!notification) {

        return res.status(404).json({
          message: "Notification not found."
        });

      }

      res.json({
        message: "Notification marked as read.",
        notification
      });

    } catch (error) {

      console.error(
        "Mark notification read error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update notification."
      });

    }

  }
);


/* =========================================================
   MARK ALL USER NOTIFICATIONS AS READ
   PATCH /api/notifications/user/:userId/read-all
========================================================= */

router.patch(
  "/user/:userId/read-all",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.userId
        );

      if (!user) {

        return res.status(404).json({
          message: "User not found."
        });

      }

      await Notification.updateMany(
        {
          userId: req.params.userId,
          isRead: false
        },
        {
          $set: {
            isRead: true
          }
        }
      );

      res.json({
        message:
          "All notifications marked as read."
      });

    } catch (error) {

      console.error(
        "Mark all notifications error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update notifications."
      });

    }

  }
);


module.exports = router;