import React from "react";
import { Link } from "react-router-dom";
import FriendsIcon from "./FriendsIcon";
import FriendRequestsIcon from "./FriendRequestsIcon";
import MessagesIcon from "./MessagesIcon";
import FriendSuggestionsIcon from "./FriendSuggestionsIcon";
import SearchBar from "./SearchBar";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  return (
    <nav className="w-64 bg-white shadow-lg p-4">
      <SearchBar />
      <ul className="mt-4">
        <li>
          <Link to="/dashboard/friends" className="flex items-center p-2 hover:bg-gray-200 rounded">
            <FriendsIcon />
            <span className="ml-2">Friends</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard/friend-requests" className="flex items-center p-2 hover:bg-gray-200 rounded">
            <FriendRequestsIcon />
            <span className="ml-2">Friend Requests</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard/messages" className="flex items-center p-2 hover:bg-gray-200 rounded">
            <MessagesIcon />
            <span className="ml-2">Messages</span>
          </Link>
        </li>
        <li>
          <Link to="/dashboard/friend-suggestions" className="flex items-center p-2 hover:bg-gray-200 rounded">
            <FriendSuggestionsIcon />
            <span className="ml-2">Friend Suggestions</span>
          </Link>
        </li>
      </ul>
      <ProfileDropdown />
    </nav>
  );
};

export default Navbar;