const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Your User model
const redisClient = require("../config/redis"); // Redis client

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h", // Set token expiration
      });
  
      // Save token in Redis for session management
      await redisClient.setEx(`user:${user._id}`, 3600, token); // Key: user:{id}, Value: token, TTL: 1hr
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
