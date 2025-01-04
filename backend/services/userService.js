const User = require("../models/User");

exports.getUserByEmail = async (email) => {
  return await User.findOne({ email });
};
