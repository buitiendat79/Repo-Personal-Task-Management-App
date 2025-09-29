import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import { supabase } from "../api/supabaseClient";
import { setUser } from "../features/auth/AuthSlice";
import DashboardLayout from "../layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

type AuthUser = {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as AuthUser | null;
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let currentUser = user;

        // Nếu Redux chưa có user HOẶC thiếu display_name thì fetch lại
        if (!currentUser || !currentUser.display_name) {
          const {
            data: { user: authUser },
            error,
          } = await supabase.auth.getUser();
          if (error) throw error;
          if (!authUser) return;

          const normalizedUser: AuthUser = {
            id: authUser.id,
            email: authUser.email ?? "",
            display_name: (authUser.user_metadata as any)?.display_name ?? "",
            created_at: authUser.created_at,
          };

          dispatch(setUser(normalizedUser));
          currentUser = normalizedUser;
        }

        if (!currentUser) return;

        // Đếm số task của user
        const { count, error: taskError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", currentUser.id);

        if (taskError) throw taskError;
        setTotalTasks(count ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, dispatch]);

  if (loading) {
    return <div className="p-6 text-center text-lg">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-lg">
        Không tìm thấy thông tin người dùng
      </div>
    );
  }

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("vi-VN")
    : "Chưa có";

  const displayName =
    user.display_name && user.display_name.trim() !== ""
      ? user.display_name
      : "Chưa cập nhật tên";

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="bg-white shadow-lg rounded-2xl p-12 max-w-xl w-full text-center">
          <h1 className="text-4xl font-bold mb-10">Hồ sơ cá nhân</h1>
          <img
            src={"/user.png"}
            alt="Avatar"
            className="w-36 h-36 rounded-full mx-auto mb-6 border-4 border-gray-200"
          />
          <h2 className="text-xl font-semibold mb-2">{displayName}</h2>
          <p className="text-gray-600 text-lg">{user.email}</p>
          <div className="mt-6 space-y-3 text-lg">
            <p>
              <span className="font-medium">Ngày đăng ký:</span> {formattedDate}
            </p>
            <p>
              <span className="font-medium">Số task đã tạo:</span> {totalTasks}
            </p>
          </div>
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => navigate("/editprofile")}
              className="border px-12 py-2 font-semibold rounded-md hover:bg-gray-50 text-lg"
            >
              Sửa thông tin
            </button>
            <button
              onClick={() => navigate("/change_password")}
              className="bg-blue-600 text-white font-semibold px-12 py-2 rounded-md hover:bg-blue-700 text-lg"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
