import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./pages/SocketContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import FriendsList from "./components/FriendsList";
import FriendRequestsList from "./components/FriendRequestsList";
import ConversationsList from "./components/ConversationsList";
import FriendSuggestionsList from "./components/navbar/FriendSuggestionsList";

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="friends" element={<FriendsList />} />
            <Route path="friend-requests" element={<FriendRequestsList />} />
            <Route path="messages" element={<ConversationsList />} />
            <Route path="friend-suggestions" element={<FriendSuggestionsList />} />
          </Route>
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;