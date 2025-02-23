const { verifyVoice } = require("./azureSpeakerRecognition");

const compareVoiceSamples = async (storedVoicePath, newVoicePath) => {
  const profileId = "user_profile_id"; // Replace with the user's profile ID
  return await verifyVoice(profileId, newVoicePath);
};

module.exports = { compareVoiceSamples };