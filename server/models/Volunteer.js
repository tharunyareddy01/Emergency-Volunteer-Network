const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    bloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
      ],
      required: true
    },

    skills: {
      type: [String],
      default: []
    },

    emergencyTypes: {
      type: [String],
      default: []
    },

    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    },

    location: {
      type: String,
      default: ""
    },

    availability: {
      type: Boolean,
      default: false
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },

    rating: {
      type: Number,
      default: 0
    },

    totalHelps: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);