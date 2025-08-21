import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

const Header: React.FC = () => {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    // Lấy user từ Auth
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // display_name nằm trong user.user_metadata
        setDisplayName(
          user.user_metadata?.display_name || user.email || "Guest"
        );
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-xl">
      <div className="flex items-center gap-2">
        <div className="w-10 h-9 bg-gray-400 rounded-md flex items-center justify-center">
          <div className="w-5 h-4 bg-white rounded-sm" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-black font-medium">{displayName}</span>
        <img
          src="/user.png"
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
};

export default Header;
