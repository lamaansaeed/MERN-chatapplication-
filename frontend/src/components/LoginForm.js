import React, { useState } from "react";

const LoginForm = ({ onSubmit, onForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
      >
        Login
      </button>

      {/* Forgot Password Button */}
      <button
        type="button"
        onClick={onForgotPassword}
        className="w-full py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300"
      >
        Forgot Password?
      </button>
    </form>
  );
};

export default LoginForm;