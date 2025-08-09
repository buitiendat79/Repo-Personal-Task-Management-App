// CustomDateInput.tsx
import React from "react";
import { FiCalendar } from "react-icons/fi";

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="w-full border border-gray-200 rounded px-4 py-2 text-left flex items-center justify-between"
  >
    <span>{value || ""}</span>
    <FiCalendar className="text-black-800" />
  </button>
));

CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
