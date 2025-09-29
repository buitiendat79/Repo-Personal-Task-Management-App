import React from "react";
import { createRoot } from "react-dom/client";

function createToast(message: string, type: "success" | "error") {
  const toast = document.createElement("div");
  document.body.appendChild(toast);

  const root = createRoot(toast);
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  root.render(
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded shadow-lg z-[9999] transition-opacity duration-300`}
    >
      {message}
    </div>
  );

  setTimeout(() => {
    root.unmount();
    toast.remove();
  }, 1000);
}

export function notifySuccess(message: string) {
  createToast(message, "success");
}

export function notifyError(message: string) {
  createToast(message, "error");
}
