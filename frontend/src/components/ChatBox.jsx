import React, { useState, useEffect, useContext, useRef } from "react";
import SocketContext from "../pages/SocketContext";

const ChatBox = ({ receiverId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const chatBoxRef = useRef(null);
  const socket = useContext(SocketContext);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/api/messages?receiverId=${receiverId}&page=${page}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data.length < 10) {
          setHasMore(false); // No more messages to load
        }

        // Append new messages to the beginning of the list
        setMessages((prevMessages) => {
          const uniqueMessages = data.filter(
            (message) => !prevMessages.some((m) => m._id === message._id)
          );
          return [...uniqueMessages.reverse(), ...prevMessages];
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [receiverId, page]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (message) => {
        if (message.sender === receiverId || message.receiver === receiverId) {
          setMessages((prevMessages) => {
            // Avoid adding duplicate messages
            if (!prevMessages.some((m) => m._id === message._id)) {
              return [...prevMessages, message];
            }
            return prevMessages;
          });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [socket, receiverId]);

  // Send a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const token = localStorage.getItem("token");
    const senderId = JSON.parse(atob(token.split(".")[1])).id; // Decode token to get senderId

    const message = {
      senderId,
      receiverId,
      content: newMessage,
    };

    // Emit the message via Socket.IO
    socket.emit("sendMessage", message);

    // Add the message to the local state immediately
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        _id: Date.now().toString(), // Temporary ID for local rendering
        sender: senderId,
        receiver: receiverId,
        content: newMessage,
        createdAt: new Date(),
      },
    ]);

    // Clear the input
    setNewMessage("");
  };

  // Handle scroll to load older messages
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore) {
      setPage((prevPage) => prevPage + 1); // Load the next page of messages
    }
  };

  // Get the current user's ID
  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    return JSON.parse(atob(token.split(".")[1])).id;
  };

  return (
    <div className="fixed bottom-0 right-0 w-96 bg-white shadow-lg rounded-t-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Chat with User</h2>
        <button onClick={onClose} className="text-red-500 hover:text-red-700">
          Close
        </button>
      </div>
      <div
        ref={chatBoxRef}
        onScroll={handleScroll}
        className="p-4 h-64 overflow-y-auto"
      >
        {messages.map((message) => {
          const isCurrentUser = message.sender === getCurrentUserId();
          return (
            <div
              key={message._id}
              className={`flex flex-col mb-2 ${
                isCurrentUser ? "items-end" : "items-start"
              }`}
            >
              <p className="text-xs text-gray-500">
                {isCurrentUser ? "You" : message.senderUsername}
              </p>
              <div
                className={`p-2 rounded-lg max-w-[70%] ${
                  isCurrentUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          );
        })}
        {!hasMore && <p className="text-center text-gray-500">No more messages</p>}
      </div>
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSendMessage}
          className="mt-2 p-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;