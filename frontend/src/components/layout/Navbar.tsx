"use client";

import { useAuth } from "../../hooks/useAuth";
import { Bell, Menu, UserCircle, LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 mr-4 rounded-lg hover:bg-gray-100 text-gray-600 transition">
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
          {/* Breadcrumb could go here */}
          <span className="text-sm font-semibold text-gray-800 capitalize">{user?.role?.replace("_", " ")} Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-3 pr-1 rounded-full border hover:shadow-md transition"
          >
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.fullName}</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <UserCircle size={20} />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
              <div className="px-4 py-2 border-b mb-2">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <User size={16} /> Profile
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); logout(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
