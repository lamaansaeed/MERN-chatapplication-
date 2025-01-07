import React, { useState, useEffect } from "react";
import ChatBox from "../ChatBox"; // Import the ChatBox component

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]); // Store the user's friends
  const [selectedUser, setSelectedUser] = useState(null); // Track the selected user for chat

  // Fetch the user's friends when the component mounts
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

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/search/users?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      // Check if each searched user is a friend
      const resultsWithFriendStatus = data.map((user) => ({
        ...user,
        isFriend: friends.some((friend) => friend.friend._id === user._id),
      }));

      setSearchResults(resultsWithFriendStatus);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

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
        handleSearch(); // Refresh search results
      } else {
        alert(data.message || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Something went wrong");
    }
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
        handleSearch(); // Refresh search results
      } else {
        alert("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      alert("Something went wrong");
    }
  };

  const handleChat = (user) => {
    if (user.isFriend) {
      // Open chat box for the selected user
      setSelectedUser(user);
    } else {
      alert("You cannot chat with this user. You are not friends.");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button onClick={handleSearch} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Search
      </button>
      <ul>
        {searchResults.map((user) => {
          const isFriend = user.isFriend; // Now this is dynamically checked
          return (
            <li key={user._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
              <span>{user.username}</span>
              <div>
                {isFriend ? (
                  <button
                    onClick={() => handleRemoveFriend(user._id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Remove Friend
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddFriend(user._id)}
                    className="text-green-500 hover:text-green-700 ml-2"
                  >
                    Add Friend
                  </button>
                )}
                <button
                  onClick={() => handleChat(user)}
                  className="text-blue-500 hover:text-blue-700 ml-2"
                >
                  Chat
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Render the ChatBox if a user is selected */}
      {selectedUser && (
        <ChatBox receiverId={selectedUser._id} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default SearchBar;