const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    emergencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Emergency",
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    senderRole: {
      type: String,
      enum: ["requester", "volunteer"],
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Message", messageSchema);