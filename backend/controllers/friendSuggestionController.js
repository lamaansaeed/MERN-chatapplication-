const redisClient = require("../config/redis");
const Friend = require("../models/Friend");
const User  = require("../models/User");
exports.suggestFriends = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID
    //const cacheKey = `friend-suggestions:${userId}`; // Redis cache key

    // Check if the result is cached in Redis
    //const cachedSuggestions = await redisClient.get(cacheKey);
    // if (cachedSuggestions) {
    //   return res.status(200).json(JSON.parse(cachedSuggestions));
    // }

    // Step 1: Find the user's friends
    const userFriends = await Friend.find({ user: userId }).select("friend");
    const userFriendIds = userFriends.map((friend) => friend.friend);

    // Step 2: Find friends of friends (excluding the user and their existing friends)
    const friendsOfFriends = await Friend.find({
      user: { $in: userFriendIds },
      friend: { $ne: userId, $nin: userFriendIds }, // Exclude the user and their existing friends
    }).select("friend");

    // Step 3: Count mutual friends for each suggested user
    const mutualFriendCounts = {};
    friendsOfFriends.forEach((friend) => {
      const suggestedUserId = friend.friend.toString();
      if (!mutualFriendCounts[suggestedUserId]) {
        mutualFriendCounts[suggestedUserId] = 0;
      }
      mutualFriendCounts[suggestedUserId]++;
    });

    // Step 4: Sort suggested users by the number of mutual friends
    const sortedSuggestions = Object.keys(mutualFriendCounts).sort(
      (a, b) => mutualFriendCounts[b] - mutualFriendCounts[a]
    );

    // Step 5: Fetch details of the top suggested users (e.g., top 10)
    const topSuggestions = sortedSuggestions.slice(0, 10);
    const suggestedUsers = await User.find({
      _id: { $in: topSuggestions },
    }).select("username email");

    // // Cache the results in Redis for 5 minutes
    // await redisClient.setEx(cacheKey, 300, JSON.stringify(suggestedUsers));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Friend Suggestion Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};