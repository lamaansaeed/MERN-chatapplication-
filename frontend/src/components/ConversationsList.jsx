import React, { useState, useEffect } from "react";
import ChatBox from "./ChatBox"; // Import the ChatBox component

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Track the selected user for chat

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/conversation", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log(data);
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  const handleOpenChat = (conversation) => {
    // Find the other participant in the conversation
    const otherParticipant = conversation.participants.find(
      (participant) => participant._id !== JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id
    );
    setSelectedUser(otherParticipant); // Set the selected user for chat
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
            <span>{conversation.participants[0].username}</span>
            <div>
              <button
                onClick={() => handleOpenChat(conversation)}
                className="text-blue-500 hover:text-blue-700"
              >
                Open Chat
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

export default ConversationsList;