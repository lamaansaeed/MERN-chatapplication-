import React, { useState, useEffect } from "react";
import ChatBox from "./ChatBox"; // Import the ChatBox component

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Track the selected user for chat

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/friends", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, []);

  const handleChat = (friend) => {
    setSelectedUser(friend.friend); // Set the selected user for chat
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/friends/${friendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Friend removed successfully!");
        setFriends((prevFriends) => prevFriends.filter((friend) => friend._id !== friendId));
      } else {
        alert("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
            <span>{friend.friend.username}</span>
            <div>
              <button
                onClick={() => handleChat(friend)}
                className="text-blue-500 hover:text-blue-700"
              >
                Chat
              </button>
              <button
                onClick={() => handleRemoveFriend(friend._id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Render the ChatBox if a user is selected */}
      {selectedUser && (
        <ChatBox receiverId={selectedUser._id} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default FriendsList;