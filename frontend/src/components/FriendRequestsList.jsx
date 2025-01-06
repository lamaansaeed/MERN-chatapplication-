import React, { useEffect, useState } from "react";

const FriendRequestsList = () => {
  const [requests, setRequests] = useState([]);

  // Fetch friend requests when the component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/friend-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };
    fetchRequests();
  }, []);

  // Handle accepting a friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/friend-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "accepted" }), // Update the status to "accepted"
      });

      if (response.ok) {
        alert("Friend request accepted!");
        // Remove the accepted request from the list
        setRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));
      } else {
        alert("Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Something went wrong");
    }
  };

  // Handle rejecting a friend request
  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/friend-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }), // Update the status to "rejected"
      });

      if (response.ok) {
        alert("Friend request rejected!");
        // Remove the rejected request from the list
        setRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));
      } else {
        alert("Failed to reject friend request");
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
      <ul>
        {requests.map((request) => (
          <li key={request._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
            <span>{request.sender.username}</span>
            <div>
              <button
                onClick={() => handleAcceptRequest(request._id)}
                className="text-green-500 hover:text-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => handleRejectRequest(request._id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendRequestsList;