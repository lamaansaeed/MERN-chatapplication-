const express = require("express");
const { registerUser } = require("../controllers/userController");
const {login,forgotPassword,voiceAuth,resetPassword} = require('../controllers/userController');
const router = express.Router();

router.post("/register", registerUser);
router.post('/login',login);
// Forgot Password
router.post("/forgot-password", forgotPassword);

// Voice Authentication
router.post("/voice-auth", voiceAuth);

// Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;
