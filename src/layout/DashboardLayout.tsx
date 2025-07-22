import React from "react";
import Sidebar from "../components/SideBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-200">
      <Sidebar />
      <div className="flex-1 overflow-y-auto py-6 pr-6 ml-6">{children}</div>
    </div>
  );
};

export default DashboardLayout;
