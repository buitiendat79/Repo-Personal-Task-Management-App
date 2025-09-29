import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../app/store";
import { supabase } from "../api/supabaseClient";
import { setUser } from "../features/auth/AuthSlice";
import DashboardLayout from "../layout/DashboardLayout";

type AuthUser = {
  id: string;
  email: string;
  display_name?: string; // từ Supabase Auth user_metadata
  created_at: string;
};

export default function EditProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storeUser = useSelector(
    (s: RootState) => s.auth.user
  ) as AuthUser | null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [fullName, setFullName] = useState<string>(""); // bind với display_name (có thể rỗng)
  const [email, setEmail] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/user.png");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Luôn lấy user mới nhất từ Supabase Auth rồi đồng bộ Redux
  useEffect(() => {
    const loadFreshAuthUser = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;

        if (!authUser) {
          setLoading(false);
          return;
        }

        const fresh: AuthUser = {
          id: authUser.id,
          email: authUser.email ?? "",
          display_name: (authUser.user_metadata as any)?.display_name ?? "",
          created_at: authUser.created_at,
        };

        // Đồng bộ Redux để mọi trang dùng chung dữ liệu mới nhất
        dispatch(setUser(fresh));

        // Bind UI
        setFullName(fresh.display_name ?? "");
        setEmail(fresh.email);
        setCreatedAt(
          fresh.created_at
            ? new Date(fresh.created_at).toLocaleDateString("vi-VN")
            : ""
        );
        setAvatarUrl("/user.png");
      } catch (e) {
        console.error(e);
        setMsg("Không tải được dữ liệu người dùng.");
      } finally {
        setLoading(false);
      }
    };

    loadFreshAuthUser();
    // Không phụ thuộc storeUser để tránh loop; luôn lấy fresh từ Auth khi vào trang
  }, [dispatch]);

  const onChooseImageClick = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setMsg("Vui lòng chọn file ảnh hợp lệ.");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setMsg("Ảnh tối đa 3MB.");
      return;
    }
    setAvatarUrl(URL.createObjectURL(f));
  };

  // Lưu display_name vào Supabase Auth
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeUser) return;

    setSaving(true);
    setMsg("");

    try {
      const nextName = fullName.trim();
      // Nếu rỗng thì xóa key cho sạch (null) ; nếu có thì lưu chuỗi
      const { error: updateErr } = await supabase.auth.updateUser({
        data: { display_name: nextName || null },
      });
      if (updateErr) throw updateErr;

      // Refetch để chắc chắn Redux đồng bộ metadata mới nhất
      const {
        data: { user: authUser2 },
        error: refetchErr,
      } = await supabase.auth.getUser();
      if (refetchErr) throw refetchErr;

      if (authUser2) {
        dispatch(
          setUser({
            id: authUser2.id,
            email: authUser2.email ?? "",
            display_name: (authUser2.user_metadata as any)?.display_name ?? "",
            created_at: authUser2.created_at,
          })
        );
        // Cập nhật lại input theo dữ liệu chính thức vừa lưu
        setFullName((authUser2.user_metadata as any)?.display_name ?? "");
      }

      setMsg("Cập nhật thành công");
    } catch (err: any) {
      console.error(err);
      setMsg(err?.message || String(err) || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center text-lg">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  if (!storeUser) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center text-lg">
          Không tìm thấy người dùng.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-200 flex justify-center items-start py-16 px-2">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8 h-fit">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Sửa thông tin cá nhân
          </h1>

          {/* Avatar + nút thay ảnh */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src={avatarUrl || "/user.png"}
              alt="Avatar"
              className="w-36 h-36 rounded-full object-cover border-4 border-gray-100"
            />
            <div>
              <button
                type="button"
                onClick={onChooseImageClick}
                className="border px-4 py-2 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 5h16v14H4z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 16l4-4 3 3 4-5 5 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                Thay ảnh
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Họ tên (display_name trong Auth) */}
            <div>
              <label htmlFor="fullName" className="block mb-1 font-medium">
                Họ tên
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg p-3 text-base"
                placeholder="Nhập họ tên"
              />
            </div>

            {/* Email (disabled) */}
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full border rounded-lg p-3 text-base bg-gray-100 text-gray-500"
              />
            </div>

            {/* Ngày đăng ký (disabled) */}
            <div>
              <label htmlFor="createdAt" className="block mb-1 font-medium">
                Ngày đăng ký
              </label>
              <input
                id="createdAt"
                type="text"
                value={createdAt}
                disabled
                className="w-full border rounded-lg p-3 text-base bg-gray-100 text-gray-500"
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full rounded-lg py-3 font-semibold border hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>

            {msg && (
              <p
                className={`text-center font-medium ${
                  msg.includes("thành công") ? "text-green-600" : "text-red-600"
                }`}
              >
                {msg}
              </p>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
