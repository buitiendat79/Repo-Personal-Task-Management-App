import React from "react";
import clsx from "clsx";

interface SidebarItemProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "text-left px-3 py-2 rounded-md font-medium transition-all",
        isActive ? "bg-gray-400 text-white" : "text-white hover:bg-gray-500"
      )}
    >
      {label}
    </button>
  );
};
