import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../api/supabaseClient";
import { setUser } from "../auth/AuthSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [remember, setRemember] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email không hợp lệ";

    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrors({
        general: error.message.includes("Invalid login credentials")
          ? "Email hoặc mật khẩu không đúng"
          : error.message,
      });
      setLoading(false);
      return;
    }

    if (remember) {
      localStorage.setItem("rememberedUser", email);
    } else {
      localStorage.removeItem("rememberedUser");
    }

    dispatch(setUser(data.user));
    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
        data-testid="form-login"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            aria-describedby="email-error"
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-sm">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-1">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full border px-3 py-2 rounded pr-12"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              aria-describedby="password-error"
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
                tabIndex={-1}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            )}
          </div>
          {errors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center tabindex">
            <input
              type="checkbox"
              className="mr-2"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            Nhớ đăng nhập
          </label>
          <Link
            to="/forgot-password"
            className="text-blue-600 underline text-sm"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {errors.general && (
          <p className="text-red-500 mb-4 text-sm text-center">
            {errors.general}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm mt-4">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 underline">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
}
