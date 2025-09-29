import { useState } from "react";
import { supabase } from "../api/supabaseClient";
import DashboardLayout from "../layout/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePW() {
  const user = useSelector((state: RootState) => state.auth.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // State cho show/hide password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword)
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";

    if (!newPassword) newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (newPassword.length < 8)
      newErrors.newPassword = "Mật khẩu tối thiểu 8 ký tự";
    else if (!/\d/.test(newPassword))
      newErrors.newPassword = "Mật khẩu phải chứa số";
    else if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(newPassword))
      newErrors.newPassword = "Mật khẩu phải chứa ký tự đặc biệt";

    if (!confirmPassword)
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    else if (confirmPassword !== newPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyCurrentPassword = async (pwd: string) => {
    const { data, error } = await supabase.rpc("verify_user_password", {
      password: pwd,
    });
    if (error) throw error;
    const verified = Array.isArray(data) ? data[0] : data;
    return !!verified;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});

    if (!validate()) return;

    if (!user?.email) {
      setErrors({ currentPassword: "Không tìm thấy email người dùng" });
      return;
    }

    try {
      setLoading(true);
      const isValid = await verifyCurrentPassword(currentPassword);
      if (!isValid) {
        setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (err: any) {
      setErrors({
        confirmPassword: err?.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm render input với icon
  const renderPasswordInput = (
    label: string,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    error?: string,
    show: boolean = false,
    toggleShow?: () => void
    // placeholder?: string
  ) => (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 pr-12"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          // placeholder={placeholder}
        />
        {toggleShow && value && (
          <button
            type="button"
            onClick={toggleShow}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {renderPasswordInput(
              "Mật khẩu hiện tại",
              currentPassword,
              setCurrentPassword,
              errors.currentPassword,
              showCurrent,
              () => setShowCurrent((prev) => !prev),
              "Nhập mật khẩu hiện tại"
            )}

            {renderPasswordInput(
              "Mật khẩu mới",
              newPassword,
              setNewPassword,
              errors.newPassword,
              showNew,
              () => setShowNew((prev) => !prev),
              "Nhập mật khẩu mới"
            )}

            {renderPasswordInput(
              "Nhập lại mật khẩu mới",
              confirmPassword,
              setConfirmPassword,
              errors.confirmPassword,
              showConfirm,
              () => setShowConfirm((prev) => !prev),
              "Nhập lại mật khẩu mới"
            )}

            {message && <p className="text-green-600 text-sm">{message}</p>}

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-6 py-2 border rounded-md font-semibold hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
              >
                {loading ? "Đang lưu..." : "Lưu mật khẩu mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
