const FriendRequest = require("../models/FriendRequest");
const Friend = require("../models/Friend");
const User = require("../models/User");

// Fetch pending friend requests
exports.getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID
    const requests = await FriendRequest.find({ receiver: userId, status: "pending" }).populate("sender", "username email");
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get Friend Requests Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; // Authenticated user's ID
    const { receiverId } = req.body; // ID of the user to send the request to

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });
    if ( existingRequest && existingRequest.status=== 'pending') {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Create a new friend request
    const request = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });
    await request.save();

    res.status(201).json({ message: "Friend request sent successfully", request });
  } catch (error) {
    console.error("Send Friend Request Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Cancel a friend request
exports.cancelFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId; // ID of the request to cancel
    const userId = req.user.id; // Authenticated user's ID

    // Find and delete the request
    const request = await FriendRequest.findOneAndDelete({
      _id: requestId,
      sender: userId,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    res.status(200).json({ message: "Friend request cancelled successfully" });
  } catch (error) {
    console.error("Cancel Friend Request Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Accept or reject a friend request
exports.respondToFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId; // ID of the request to respond to
    const { status } = req.body; // "accepted" or "rejected"

    // Find the request
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Update the request status
    request.status = status;
    await request.save();

    // If the request is accepted, add each user to the other's friend list
    if (status === "accepted") {
      const friend1 = new Friend({ user: request.sender, friend: request.receiver });
      const friend2 = new Friend({ user: request.receiver, friend: request.sender });
      await friend1.save();
      await friend2.save();
    }

    res.status(200).json({ message: `Friend request ${status} successfully`, request });
  } catch (error) {
    console.error("Respond to Friend Request Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};