import React from "react";
import clsx from "clsx";

interface SidebarItemProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-left px-3 py-2 rounded-md text-xl font-medium transition-all flex items-center gap-3",
        isActive ? "bg-gray-600 text-white" : "text-white hover:bg-gray-500"
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
