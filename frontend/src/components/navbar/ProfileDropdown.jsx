import React from "react";

const ProfileDropdown = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="mt-4">
      <button onClick={handleLogout} className="w-full p-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </div>
  );
};

export default ProfileDropdown;