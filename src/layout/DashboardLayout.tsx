import React from "react";
import Sidebar from "../components/SideBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-200">
      {/* Sidebar dính trái, full theo nội dung, bo góc phải */}
      <div className="pt-6 pb-6">
        <div className="h-full">
          <Sidebar />
        </div>
      </div>

      {/* Main content scroll độc lập */}
      <div className="flex-1 overflow-y-auto py-6 pr-6 ml-6">{children}</div>
    </div>
  );
};

export default DashboardLayout;
