const User = require("../models/User");
//const redisClient = require("../config/redis");

// Search for users by username or email
exports.searchUsers = async (req, res) => {
    
  try {
    // console.log(req.user)
    // if (!req.user) {
    //     return res.status(401).json({ message: "Unauthorized  access" });
    //   }
    const { search } = req.query; // Search query (username or email)
    // const cacheKey = `search:${search}`; // Redis cache key
    
    // // Check if the result is cached in Redis
    // const cachedResults = await redisClient.get(cacheKey);
    // if (cachedResults) {
    //   return res.status(200).json(JSON.parse(cachedResults));
    // }

    // Perform the search in the database
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: "i" } }, // Case-insensitive search for username
        { email: { $regex: search, $options: "i" } }, // Case-insensitive search for email
      ],
    }).select("username email"); // Only return username and email

    // // Cache the results in Redis for 5 minutes
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(users));

    res.status(200).json(users);
  } catch (error) {
    console.error("Search Users Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};