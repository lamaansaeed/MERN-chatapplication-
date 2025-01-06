const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ], // Users involved in the conversation
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Reference to the last message in the conversation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of the last activity in the conversation
});

module.exports = mongoose.model("Conversation", conversationSchema);