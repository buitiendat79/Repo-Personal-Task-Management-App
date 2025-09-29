import { useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});

    if (!validate()) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setMessage("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/"), 1500);
    } catch (err: any) {
      setErrors({
        confirmPassword: err?.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    id: string,
    label: string,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    error?: string,
    show: boolean = false,
    toggleShow?: () => void
  ) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 pr-12"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Reset your password
        </h2>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {renderPasswordInput(
            "newPassword",
            "Mật khẩu mới",
            newPassword,
            setNewPassword,
            errors.newPassword,
            showNew,
            () => setShowNew((prev) => !prev)
          )}

          {renderPasswordInput(
            "confirmPassword",
            "Nhập lại mật khẩu mới",
            confirmPassword,
            setConfirmPassword,
            errors.confirmPassword,
            showConfirm,
            () => setShowConfirm((prev) => !prev)
          )}

          {message && <p className="text-green-600 text-sm">{message}</p>}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
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
  );
}
