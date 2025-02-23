const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require('fs');
require("dotenv").config();

// Set up Azure credentials
const speechKey = process.env.AZURE_SPEAKER_RECOGNITION_KEY;
const speechRegion = 'eastus'||process.env.AZURE_SPEAKER_RECOGNITION_ENDPOINT.split(".")[0]; // Extract region from endpoint
console.log(speechRegion);
// Enroll a user's voice
const enrollVoice = async (voiceFilePath) => {
    try {
        // Read the WAV file into a Buffer
        const audioBuffer = fs.readFileSync(voiceFilePath);
    
        // Create Azure configurations
        const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
        const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
    
        // Create a voice profile
        const profileClient = new sdk.VoiceProfileClient(speechConfig);
        const profile = await profileClient.createProfileAsync(
          sdk.VoiceProfileType.TextDependentVerification,
          "en-US"
        );
    
        // Enroll the voice sample
        const recognizer = new sdk.SpeakerRecognizer(speechConfig, audioConfig);
        await recognizer.recognizeOnceAsync((result) => {
          if (result.reason === sdk.ResultReason.EnrolledVoiceProfile) {
            console.log("Voice profile enrolled successfully.");
          } else {
            throw new Error("Failed to enroll voice profile.");
          }
        });
    
        return profile.profileId;
      } catch (error) {
        console.error("Error in enrollVoice:", error);
        throw error;
      }
};

// Verify a user's voice
const verifyVoice = async (profileId, voiceFilePath) => {
    try {
      // Read the WAV file into a Buffer
      const audioBuffer = fs.readFileSync(voiceFilePath);
  
      // Create Azure configurations
      const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
      const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBuffer);
  
      // Verify the voice sample
      const profileClient = new sdk.VoiceProfileClient(speechConfig);
      const profile = await profileClient.getProfileAsync(profileId);
  
      const recognizer = new sdk.SpeakerRecognizer(speechConfig, audioConfig);
      const result = await recognizer.recognizeOnceAsync();
  
      return result.profileId === profileId;
    } catch (error) {
      console.error("Error in verifyVoice:", error);
      throw error;
    }
  };
  
  module.exports = { enrollVoice, verifyVoice };
  