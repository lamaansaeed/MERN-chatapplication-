const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who sent the message
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who received the message
  content: { type: String, required: true }, // The message content
  isRead: { type: Boolean, default: false }, // Whether the message has been read
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the message was sent
});

module.exports = mongoose.model("Message", messageSchema);