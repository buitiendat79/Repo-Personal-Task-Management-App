import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../api/supabaseClient";
import { setUser } from "../auth/AuthSlice";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email là bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email không hợp lệ";
    if (password.length < 8)
      newErrors.password = "Mật khẩu phải từ 8 ký tự trở lên";
    if (confirmPassword !== password)
      newErrors.confirmPassword = "Mật khẩu không khớp";
    if (!agree) newErrors.agree = "Bạn cần đồng ý với Điều khoản";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrors({ general: error.message });
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("users")
      .insert([{ id: data.user.id, email }]);

    if (insertError) {
      setErrors({ general: insertError.message });
    } else {
      dispatch(setUser(data.user));
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Đăng ký tài khoản
        </h2>

        {errors.general && (
          <p className="text-red-500 mb-4 text-sm text-center">
            {errors.general}
          </p>
        )}

        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">Nhập lại mật khẩu</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <span>
              Tôi đồng ý với{" "}
              <a href="#" className="text-blue-600 underline">
                Điều khoản & Chính sách
              </a>
            </span>
          </label>
          {errors.agree && (
            <p className="text-red-500 text-sm">{errors.agree}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <p className="text-center text-sm mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
