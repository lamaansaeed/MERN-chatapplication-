const Friend = require("../models/Friend");
const User = require("../models/User");

// Fetch the list of friends
exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID from authMiddleware
    const friends = await Friend.find({ user: userId }).populate("friend", "username email");
    res.status(200).json(friends);
  } catch (error) {
    console.error("Get Friends Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Remove a friend
exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID
    const friendId = req.params.friendId; // Friend's ID to remove

    // Remove the friend from the user's friend list
    await Friend.deleteOne({ user: userId, friend: friendId });

    // Remove the user from the friend's friend list (reciprocal)
    await Friend.deleteOne({ user: friendId, friend: userId });

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Remove Friend Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};