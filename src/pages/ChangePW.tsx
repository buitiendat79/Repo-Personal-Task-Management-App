import { useState } from "react";
import { supabase } from "../api/supabaseClient";
import DashboardLayout from "../layout/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

export default function ChangePW() {
  const user = useSelector((state: RootState) => state.auth.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    if (!user?.email) {
      setError("Không tìm thấy email người dùng");
      return;
    }

    try {
      setLoading(true);

      // ✅ Reauthenticate với mật khẩu hiện tại
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Mật khẩu hiện tại không đúng");
      }

      // ✅ Nếu đúng -> đổi mật khẩu
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
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
