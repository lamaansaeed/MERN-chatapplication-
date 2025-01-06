const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const searchController = require("../controllers/searchController");

// Search Routes
router.get("/users",authMiddleware, searchController.searchUsers); // Search for users

module.exports = router;