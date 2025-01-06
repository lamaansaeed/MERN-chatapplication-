import React, { useEffect, useState } from "react";

const FriendSuggestionsList = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/friend-suggestions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching friend suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);
  const handleAddFriend = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/friend-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: userId }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Friend request sent successfully!");
       
      } else {
        alert(data.message || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Friend Suggestions</h2>
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
            <span>{suggestion.username}</span>
            <div>
            <button
                    onClick={() => handleAddFriend(suggestion._id)}
                    className="text-green-500 hover:text-green-700 ml-2"
                  >
                    Add Friend
                  </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSuggestionsList;