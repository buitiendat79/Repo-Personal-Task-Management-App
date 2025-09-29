// src/layout/DashboardLayout.tsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, List, User, LogOut } from "lucide-react";
import { supabase } from "../api/supabaseClient";
import { useDispatch } from "react-redux";
import { clearUser } from "../features/auth/AuthSlice";
import { notifyError, notifySuccess } from "../utils/notify";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const openConfirm = () => setShowConfirm(true);
  const closeConfirm = () => !isProcessing && setShowConfirm(false);

  const handleConfirmLogout = async () => {
    setIsProcessing(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      notifyError("Đăng xuất thất bại!");
    } else {
      dispatch(clearUser());
      notifySuccess("Đăng xuất thành công!");
    }

    setTimeout(() => {
      navigate("/");
      setIsProcessing(false);
      setShowConfirm(false);
    }, 1200);
  };

  // ESC/Enter keyboard
  useEffect(() => {
    if (!showConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm();
      if (e.key === "Enter") !isProcessing && handleConfirmLogout();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showConfirm, isProcessing]);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/tasks", label: "Tasks", icon: <List size={20} /> },
    { to: "/profile", label: "Profile", icon: <User size={20} /> },
    { to: undefined, label: "Logout", icon: <LogOut size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-200">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar onLogout={openConfirm} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0 py-2 pr-4 ml-0 md:ml-4">
        {children}
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg flex justify-around py-2 z-50">
        {navItems.map((item) =>
          item.label === "Logout" ? (
            <button
              key={item.label}
              onClick={openConfirm}
              className="flex flex-col items-center text-sm text-gray-600"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.to}
              to={item.to!}
              className={`flex flex-col items-center text-sm ${
                location.pathname === item.to
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        )}
      </nav>

      {/* Confirm Logout Modal */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
          onClick={closeConfirm}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="text-lg font-semibold">Xác nhận đăng xuất</h3>
              <p className="mt-2 text-sm text-gray-600">
                Bạn có chắc chắn muốn đăng xuất không?
              </p>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-60"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60"
              >
                {isProcessing ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
