const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who sent the request
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who received the request
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }, // Status of the request
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the request was sent
});

module.exports = mongoose.model("FriendRequest", friendRequestSchema);