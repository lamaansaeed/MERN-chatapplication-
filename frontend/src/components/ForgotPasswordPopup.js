import React, { useState } from "react";

const ForgotPasswordPopup = ({ onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    onSubmit(email);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Forgot Password</h3>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
        />
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
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPopup;