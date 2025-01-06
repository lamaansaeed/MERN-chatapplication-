import React, { useEffect, useState } from "react";

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
            <span>{conversation.participants[0].username}</span>
            <div>
              <button className="text-blue-500 hover:text-blue-700">Open Chat</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationsList;