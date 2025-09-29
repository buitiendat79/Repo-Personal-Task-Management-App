import { useState, useEffect } from "react";
import { SidebarItem } from "../SideBar/SideBarItem";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiCheckCircle, FiUser, FiPower } from "react-icons/fi";
import { supabase } from "../../api/supabaseClient";
import { useDispatch } from "react-redux";
import { clearUser } from "../../features/auth/AuthSlice";
import { notifyError, notifySuccess } from "../../utils/notify";
import clsx from "clsx";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // responsive collapse
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const DELAY_MS = 1200;

  const openConfirm = () => setShowConfirm(true);
  const closeConfirm = () => {
    if (!isProcessing) setShowConfirm(false);
  };

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
    }, DELAY_MS);
  };

  // ESC để đóng modal
  useEffect(() => {
    if (!showConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm();
      if (e.key === "Enter") !isProcessing && handleConfirmLogout();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirm, isProcessing]);

  const items = [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome size={18} /> },
    {
      label: "Danh sách Task",
      path: "/tasks",
      icon: <FiCheckCircle size={18} />,
    },
    { label: "Hồ sơ cá nhân", path: "/profile", icon: <FiUser size={18} /> },
    {
      label: "Đăng xuất",
      path: undefined as unknown as string,
      icon: <FiPower size={18} />,
    },
  ];

  return (
    <>
      {/* Sidebar chính */}
      <aside
        className={clsx(
          "h-full bg-gray-700 p-4 shadow-sm rounded-r-2xl flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-[240px]",
          "hidden md:flex" // chỉ hiện từ tablet trở lên
        )}
      >
        <div
          className={clsx(
            "mb-10 flex justify-center",
            collapsed ? "px-0" : "px-2"
          )}
        >
          <div className="w-10 h-9 bg-gray-400 rounded-md flex items-center justify-center">
            <div className="w-5 h-4 bg-white rounded-sm" />
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <SidebarItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
              isActive={Boolean(item.path && pathname === item.path)}
              onClick={() =>
                item.label === "Đăng xuất"
                  ? openConfirm()
                  : item.path && navigate(item.path)
              }
            />
          ))}
        </nav>

        {/* Nút toggle collapse (tablet/desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-auto text-sm text-white bg-gray-600 rounded-md py-1 px-2 hover:bg-gray-500"
        >
          {collapsed ? "»" : "«"}
        </button>
      </aside>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-gray-700 p-4 shadow-lg rounded-r-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-10 flex justify-center">
              <div className="w-10 h-9 bg-gray-400 rounded-md flex items-center justify-center">
                <div className="w-5 h-4 bg-white rounded-sm" />
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {items.map((item) => (
                <SidebarItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  isActive={Boolean(item.path && pathname === item.path)}
                  onClick={() => {
                    setMobileOpen(false);
                    item.label === "Đăng xuất"
                      ? openConfirm()
                      : item.path && navigate(item.path);
                  }}
                />
              ))}
            </nav>
          </aside>
        </div>
      )}

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
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
