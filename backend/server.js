const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoute");
const friendRoutes = require("./routes/friendRoute");
const messageRoutes = require("./routes/messageRoute");
const searchRoutes = require("./routes/searchRoute");
const friendSuggestionRoutes = require("./routes/friendSuggestionRoute");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
});

// Middleware setup
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api", friendRoutes);
app.use("/api", messageRoutes);
app.use("/search", searchRoutes);
app.use("/api", friendSuggestionRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the application if DB connection fails
  });

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Join a room (user ID)
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (message) => {
    try {
      const { senderId, receiverId, content } = message;

      // Save the message to the database
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
      });
      await newMessage.save();

      // Update or create a conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });
      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, receiverId],
        });
      }
      conversation.lastMessage = newMessage._id;
      conversation.updatedAt = Date.now();
      await conversation.save();

      // Emit the message to the receiver
      io.to(receiverId).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error handling sendMessage:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));