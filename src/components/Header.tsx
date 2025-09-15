// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { FiMenu } from "react-icons/fi";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setDisplayName(
          user.user_metadata?.display_name || user.email || "Guest"
        );
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-xl sm:px-4 sm:py-3">
      <div className="flex items-center gap-3">
        {/* Hamburger menu: chỉ hiện trên mobile */}
        {onToggleSidebar && (
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Logo + title */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-9 bg-gray-400 rounded-md flex items-center justify-center sm:w-8 sm:h-7">
            <div className="w-5 h-4 bg-white rounded-sm sm:w-4 sm:h-3" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-xl">
            Dashboard
          </h1>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3">
        <span className="text-black font-medium hidden sm:inline">
          {displayName}
        </span>
        <img
          src="/user.png"
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover sm:w-8 sm:h-8"
        />
      </div>
    </header>
  );
};

export default Header;
