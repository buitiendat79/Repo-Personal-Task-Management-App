import { SidebarItem } from "../SideBar/SideBarItem";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiCheckCircle, FiUser, FiPower } from "react-icons/fi";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome size={18} /> },
    {
      label: "Danh sách Task",
      path: "/tasks",
      icon: <FiCheckCircle size={18} />,
    },
    { label: "Hồ sơ cá nhân", path: "#", icon: <FiUser size={18} /> },
    { label: "Đăng xuất", path: "#", icon: <FiPower size={18} /> },
  ];

  return (
    <aside className="w-[240px] h-full bg-gray-700 p-4 shadow-sm rounded-r-2xl">
      <div className="mb-10">
        <div className="w-10 h-9 bg-gray-400 rounded-md flex items-center justify-center">
          <div className="w-5 h-4 bg-white rounded-sm" />
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <SidebarItem
            key={item.label}
            label={item.label}
            icon={item.icon} // truyền icon xuống
            isActive={pathname === item.path}
            onClick={() => item.path !== "#" && navigate(item.path)}
          />
        ))}
      </nav>
    </aside>
  );
};
