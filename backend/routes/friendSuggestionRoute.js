const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const friendSuggestionController = require("../controllers/friendSuggestionController");
router.get("/friend-suggestions", authMiddleware, friendSuggestionController.suggestFriends);

module.exports = router;