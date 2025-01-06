import React, { useEffect, useState } from "react";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
            <span>{friend.friend.username}</span>
            <div>
              <button className="text-blue-500 hover:text-blue-700">Chat</button>
              <button className="text-red-500 hover:text-red-700 ml-2">Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;