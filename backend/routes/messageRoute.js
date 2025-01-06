const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const searchController = require("../controllers/searchController");
const messageController = require("../controllers/messageController");



// Message Routes
router.get("/messages", authMiddleware, messageController.getConversations); // Fetch conversations
router.post("/messages", authMiddleware, messageController.sendMessage); // Send a message
router.put("/messages/:messageId", authMiddleware, messageController.markMessageAsRead); // Mark a message as read

module.exports = router;