const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
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
      ],
      required: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true
    },

    bloodGroup: {
      type: String,
      default: ""
    },

    requiredSkill: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      required: true
    },

    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    },

    phoneNumber: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "Searching",
        "Volunteer Assigned",
        "Accepted",
        "On the Way",
        "Help In Progress",
        "Completed",
        "Cancelled"
      ],
      default: "Searching"
    },

    assignedVolunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Emergency",
  emergencySchema
);