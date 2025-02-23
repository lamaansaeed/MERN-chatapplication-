import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import VoiceAuthPopup from "../components/VoiceAuthPopup";
import ForgotPasswordPopup from "../components/ForgotPasswordPopup";

const Login = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVoiceAuth, setShowVoiceAuth] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Login successful!");
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      setEmail(email); 
      const response = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setShowForgotPassword(false);
        setShowVoiceAuth(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
    }
  };

  const handleVoiceAuth = async (email, voiceBlob) => {
    console.log(email);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("voiceSample", voiceBlob, "voiceSample.wav");

      const response = await fetch("http://localhost:5000/api/users/voice-auth", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Voice authentication successful! Please reset your password.");
        navigate("/reset-password");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}${errorData.email}`);
      }
    } catch (error) {
      console.error("Voice Authentication Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        <LoginForm onSubmit={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} />
      </div>

      {showForgotPassword && (
        <ForgotPasswordPopup
          onClose={() => setShowForgotPassword(false)}
          onSubmit={handleForgotPassword}
        />
      )}

      {showVoiceAuth && (
        <VoiceAuthPopup
          onClose={() => setShowVoiceAuth(false)}
          onSubmit={handleVoiceAuth}
          email={email}
        />
      )}
    </div>
  );
};

export default Login;
