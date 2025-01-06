const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who owns this friend list
  friend: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The friend
  createdAt: { type: Date, default: Date.now }, // Timestamp of when the friendship was established
});

module.exports = mongoose.model("Friend", friendSchema);