import { SidebarItem } from "../SideBar/SideBarItem";
import { useNavigate, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Danh sách Task", path: "/tasks" },
    { label: "Hồ sơ cá nhân", path: "#" },
    { label: "Đăng xuất", path: "#" },
  ];

  return (
    <aside className="w-[240px] min-h-screen bg-gray-800 p-4 shadow-sm">
      <div className="mb-10">
        <div className="w-9 h-9 bg-gray-500 rounded-md flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            label={item.label}
            isActive={pathname === item.path}
            onClick={() => item.path !== "#" && navigate(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
};
