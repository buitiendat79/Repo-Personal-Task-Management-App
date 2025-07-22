import React from "react";
// import { FaRegSquare } from "react-icons/fa6";

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md rounded-xl">
      <div className="flex items-center gap-2">
        <div className="w-10 h-9 bg-gray-400 rounded-md flex items-center justify-center">
          <div className="w-5 h-4 bg-white rounded-sm" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
