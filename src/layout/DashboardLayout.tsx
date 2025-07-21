import React from "react";
import Sidebar from "../components/SideBar/index";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};

export default DashboardLayout;
