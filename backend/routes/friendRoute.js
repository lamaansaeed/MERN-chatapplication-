const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const friendController = require("../controllers/friendController");
const friendRequestController = require("../controllers/friendRequestController");
// console.log(typeof authMiddleware);
// console.log(friendController);
// console.log(friendRequestController);
// Friends Routes
router.get("/friends", authMiddleware, friendController.getFriends); // Fetch friends
router.delete("/friends/:friendId", authMiddleware, friendController.removeFriend); // Remove a friend

// Friend Requests Routes
router.get("/friend-requests", authMiddleware, friendRequestController.getFriendRequests); // Fetch pending requests
router.post("/friend-requests", authMiddleware, friendRequestController.sendFriendRequest); // Send a friend request
router.delete("/friend-requests/:requestId", authMiddleware, friendRequestController.cancelFriendRequest); // Cancel a friend request
router.put("/friend-requests/:requestId", authMiddleware, friendRequestController.respondToFriendRequest); // Accept or reject a friend request

module.exports = router;