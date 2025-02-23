import React, { useState, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

const VoiceAuthPopup = ({ onClose, onSubmit, email }) => {
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    mimeType: "audio/wav",
  });

  // Handle recording duration (4 seconds)
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setTimeout(() => {
        stopRecording();
        setIsRecording(false);
        handleSubmit(); // Automatically submit after recording
      }, 4000); // 4 seconds
    }
    return () => clearTimeout(timer); // Cleanup timer
  }, [isRecording, stopRecording]);

  const handleStartRecording = () => {
    setError(""); // Clear any previous errors
    startRecording();
    setIsRecording(true);
  };

  const handleSubmit = async () => {
    if (!mediaBlobUrl) {
      setError("Please record your voice.");
      return;
    }

    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      onSubmit(email, blob);
    } catch (error) {
      console.error("Voice Authentication Error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Voice Authentication</h3>
        <p className="mb-4">Please say the following sentence:</p>
        <div className="p-4 bg-gray-100 rounded-md mb-4">
          <p className="text-gray-700 font-semibold">
            "The quick brown fox jumps over the lazy dog"
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-green-300"
          >
            {isRecording ? "Recording..." : "Start Recording"}
          </button>
        </div>
        {mediaBlobUrl && <audio src={mediaBlobUrl} controls className="w-full mb-4" />}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!mediaBlobUrl}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-blue-300"
          >
            Authenticate
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAuthPopup;