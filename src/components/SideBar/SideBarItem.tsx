import React from "react";
import clsx from "clsx";

interface SidebarItemProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  collapsed?: boolean; // thêm prop mới
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  isActive,
  onClick,
  collapsed = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-left px-3 py-2 rounded-md font-medium transition-all flex items-center",
        collapsed ? "justify-center" : "gap-3 text-xl",
        isActive ? "bg-gray-600 text-white" : "text-white hover:bg-gray-500"
      )}
      aria-label={label} // để screen reader đọc khi collapsed
    >
      {icon && <span className="text-lg">{icon}</span>}
      {!collapsed && <span>{label}</span>}
    </button>
  );
};
