import React from "react";
// import { FaRegSquare } from "react-icons/fa6";

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm rounded-md">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-gray-800 rounded-md flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-black font-medium">Nguyễn Văn A</span>
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
