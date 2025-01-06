const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
//const redisClient = require("../config/redis");

// Fetch all conversations with the latest message
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID
    // const cacheKey = `conversations:${userId}`; // Redis cache key

    // // Check if the result is cached in Redis
    // const cachedConversations = await redisClient.get(cacheKey);
    // if (cachedConversations) {
    //   return res.status(200).json(JSON.parse(cachedConversations));
    // }

    // Fetch conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username email") // Populate participant details
      .populate("lastMessage") // Populate the last message
      .sort({ updatedAt: -1 }); // Sort by latest activity

    // // Cache the results in Redis for 5 minutes
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(conversations));

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body; // Receiver's ID and message content
    const senderId = req.user.id; // Authenticated user's ID

    // Create a new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });
    await message.save();

    // Update or create a conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
    }
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // // Invalidate the conversations cache for both users
    // await redisClient.del(`conversations:${senderId}`);
    // await redisClient.del(`conversations:${receiverId}`);

    res.status(201).json({ message: "Message sent successfully", message });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Mark a message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.messageId; // ID of the message to mark as read
    const userId = req.user.id; // Authenticated user's ID

    // Find the message and update its status
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: userId, isRead: false }, // Only mark unread messages
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: "Message not found or already read" });
    }

    // // Invalidate the conversations cache for the user
    // await redisClient.del(`conversations:${userId}`);

    res.status(200).json({ message: "Message marked as read", message });
  } catch (error) {
    console.error("Mark Message as Read Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};