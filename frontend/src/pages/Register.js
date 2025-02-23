import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactMediaRecorder } from "react-media-recorder";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [recordings, setRecordings] = useState([]); // Store multiple recordings
  const [recordingCount, setRecordingCount] = useState(0);
  const navigate = useNavigate();

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      mimeType: "audio/wav",
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchAudioBlob = async () => {
    if (mediaBlobUrl) {
      const response = await fetch(mediaBlobUrl);
      return await response.blob();
    }
    return null;
  };

  const handleStartRecording = () => {
    if (recordingCount < 3) {
      startRecording();
      setTimeout(() => {
        stopRecording();
      }, 6000);
    }
  };

  const handleSaveRecording = async () => {
    if (recordingCount >= 3) return alert("You already recorded 3 samples!");

    const blob = await fetchAudioBlob();
    if (blob) {
      setRecordings((prev) => [...prev, blob]);
      setRecordingCount((prev) => prev + 1);
      clearBlobUrl();
    }

    if (recordingCount === 2) alert("3 recordings done! You can submit now.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (recordings.length < 3) {
      return alert("Please record all 3 voice samples before submitting.");
    }

    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);

    recordings.forEach((blob, index) =>
      formDataToSend.append("voiceSamples", blob, `voiceSample${index + 1}.wav`)
    );

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Voice Recording */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Record Your Voice (3 Samples Required)
            </label>
            <div className="w-full bg-gray-200 p-4 text-center">
              {mediaBlobUrl ? <audio src={mediaBlobUrl} controls /> : <p>No recording yet</p>}
            </div>
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={recordingCount >= 3}
              className="w-full px-4 py-2 text-white bg-green-500 rounded-md"
            >
              Start Recording ({recordingCount}/3)
            </button>
            <button
              type="button"
              onClick={handleSaveRecording}
              disabled={!mediaBlobUrl}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md"
            >
              Save Recording
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 rounded-md"
            disabled={recordings.length < 3}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
