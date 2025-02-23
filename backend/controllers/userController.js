const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Your User model
const { exec } = require("child_process");
const multer = require("multer");
const path = require("path");
// const lamejs = require("lamejs");
// const wav = require("node-wav");
// const mime = require('mime-types');
// const ffmpeg = require('fluent-ffmpeg');
 const fs = require('fs');
// const { uploadDocument ,getTranscriptionResults,startTranscription} = require("../utils/s3Utils");
// const { verifyVoice,enrollVoice } = require("../utils/azureSpeakerRecognition");
 const { convertToStandardWav} = require("../utils/audioProcessor");
 const { cosineSimilarity } = require("../utils/embeddingUtils")
require("dotenv").config();


 // Multer configuration for file upload
 const storage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, "uploads/"); // Temporary storage for files
   },
   filename: (req, file, cb) => {
     cb(null, `${Date.now()}_${file.originalname}`);
   },
 });

 const upload = multer({ storage });




// Function to extract voice embedding using pyannote.audio
const extractVoiceEmbedding = async (audioFilePath) => {
  const scriptPath = path.join(__dirname, "../pythonHelper/voice_auth.py");
  
  return new Promise((resolve, reject) => {
    exec(`python "${scriptPath}" "${audioFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      //console.log(stdout); // Debugging: Print everything returned by Python

      try {
        // Extract the last line (which should be the JSON embedding)
        const outputLines = stdout.trim().split("\n");
        const jsonLine = outputLines[outputLines.length - 1]; // Last line is the embedding

        // Extract the embedding properly
        const parsed = JSON.parse(jsonLine);
        resolve(parsed.embedding);
      } catch (parseError) {
        reject(`JSON Parsing Error: ${parseError.message}`);
      }
    });
  });
};



// Register User (with voice embedding)
exports.registerUser = [
  upload.array("voiceSamples", 3), // Accept up to 3 voice samples
  async (req, res) => {
    console.log(req.body); // Debugging
    console.log(req.files); // Debugging

    const { username, email, password } = req.body;

    try {
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: "User already exists" }); // Ensure return is used
      }

      let voiceEmbeddings = [];

      for (let file of req.files) {
        try {
          const convertedFilePath = file.path.replace(/\.[^/.]+$/, "_converted.wav");
          await convertToStandardWav(file.path, convertedFilePath);
          const embedding = await extractVoiceEmbedding(convertedFilePath);
          voiceEmbeddings.push(embedding);

          // Delete files after processing
          fs.unlinkSync(file.path);
          fs.unlinkSync(convertedFilePath);
          
        } catch (fileError) {
          console.error("Voice Processing Error:", fileError);
          return res.status(500).json({ message: "Voice Processing Error", error: fileError.message });
        }
      }
      let avgEmbedding = voiceEmbeddings[0].map((_, i) =>
        voiceEmbeddings.reduce((sum, emb) => sum + emb[i], 0) / voiceEmbeddings.length
      );
      const newUser = new User({
        username,
        email,
        password,
        voiceSamples: avgEmbedding,
      });

      await newUser.save();
      return res.status(201).json({ message: "User registered successfully" }); // Ensure return is used
    } catch (error) {
      console.error("Registration Error:", error);
      return res.status(500).json({ message: "Server error", error: error.message }); // Ensure return is used
    }
  },
];



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
  
      // // Save token in Redis for session management
      // const session = await redisClient.setEx(`user:${user._id}`, 3600, token); // Key: user:{id}, Value: token, TTL: 1hr
      // console.log(session ,'here is session');
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };

  // Reset Password Controller
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's password
    user.password = newPassword; // The pre("save") middleware will hash this password
    await user.save(); // Save the user to trigger the pre("save") middleware

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User found. Proceed to voice authentication." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



// Voice Authentication
exports.voiceAuth = [
  upload.single("voiceSample"), // Single audio sample for authentication
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.voiceSamples || user.voiceSamples.length === 0) {
        return res.status(400).json({ message: "No voice profile available" });
      }

      const convertedFilePath = req.file.path.replace(/\.[^/.]+$/, "_converted.wav");
      await convertToStandardWav(req.file.path, convertedFilePath);

      // Extract embedding for the newly recorded voice sample
      const newEmbedding = await extractVoiceEmbedding(convertedFilePath);
       console.log(user.voiceSamples.length, newEmbedding.length);
      // Compute cosine similarity between stored mean embedding and new embedding
      const similarity = cosineSimilarity(user.voiceSamples[0], newEmbedding);

      // Delete temporary files
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(convertedFilePath);

      // If similarity is above a threshold (e.g., 0.8), authentication is successful
      if (similarity > 0.8) {
        return res.status(200).json({ message: "Voice authentication successful" });
      } else {
        return res.status(401).json({ message: "Voice authentication failed" });
      }
    } catch (error) {
      console.error("Voice Auth Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
];


