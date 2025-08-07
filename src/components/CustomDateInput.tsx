// CustomDateInput.tsx
import React from "react";
import { FiCalendar } from "react-icons/fi";

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="w-full border border-gray-300 rounded-md px-4 py-2 text-left flex items-center justify-between"
  >
    <span>{value || ""}</span>
    <FiCalendar className="text-gray-500" />
  </button>
));

CustomDateInput.displayName = "CustomDateInput";

export default CustomDateInput;
