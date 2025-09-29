import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../api/supabaseClient";
import { setUser } from "./AuthSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Type cho Loi tung field
interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  agree?: string;
  general?: string;
}

// Type cac field "blur"
interface FormTouched {
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
  agree?: boolean;
}

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const validateField = async (field: string): Promise<FormErrors> => {
    const newErrors = { ...errors };

    if (field === "email") {
      if (!email) newErrors.email = "Vui lòng nhập email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        newErrors.email = "Email không hợp lệ";
      else {
        const { data } = await supabase
          .from("users")
          .select("email")
          .eq("email", email);
        if (data?.length > 0) newErrors.email = "Email đã được đăng ký";
        else delete newErrors.email;
      }
    }

    if (field === "password") {
      if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
      else if (password.length < 8)
        newErrors.password = "Mật khẩu tối thiểu 8 ký tự";
      else if (!/\d/.test(password))
        newErrors.password = "Mật khẩu phải chứa số";
      else if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password))
        newErrors.password = "Mật khẩu phải chứa ký tự đặc biệt";
      else delete newErrors.password;
    }

    if (field === "confirmPassword") {
      if (!confirmPassword)
        newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
      else if (confirmPassword !== password)
        newErrors.confirmPassword = "Mật khẩu không khớp";
      else delete newErrors.confirmPassword;
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (field: keyof FormTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErrors = await validateField("email");
    const passwordErrors = await validateField("password");
    const confirmPasswordErrors = await validateField("confirmPassword");

    const currentErrors = {
      ...emailErrors,
      ...passwordErrors,
      ...confirmPasswordErrors,
    };

    setErrors(currentErrors);

    if (
      currentErrors.email ||
      currentErrors.password ||
      currentErrors.confirmPassword
    )
      return;

    if (!agree) {
      setTouched((prev) => ({ ...prev, agree: true }));
      setErrors((prev) => ({
        ...prev,
        agree: "Bạn cần đồng ý với Điều khoản & Chính sách để tiếp tục",
      }));
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      if (error.message === "User already registered") {
        setErrors({ email: "Email đã được đăng ký" });
      } else {
        setErrors({ general: error.message });
      }
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("users")
      .insert([{ id: data.user?.id, email }]);

    if (insertError) {
      setErrors({ general: insertError.message });
    } else {
      dispatch(setUser(data.user));
      setSuccessMsg(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }

    setLoading(false);
  };

  const isValidInputs =
    email &&
    password &&
    confirmPassword &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  return (
    <>
      {successMsg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50">
          {successMsg}
        </div>
      )}
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

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
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
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
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
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-1">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full border px-3 py-2 rounded pr-12"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
              />
              {confirmPassword && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
                  tabIndex={-1}
                  title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              )}
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Checkbox */}
          <div className="mb-4">
            <label
              htmlFor="agree"
              className="flex items-center select-none cursor-pointer"
            >
              <input
                id="agree"
                type="checkbox"
                className="mr-2"
                checked={agree}
                onChange={(e) => {
                  const value = e.target.checked;
                  setAgree(value);
                  setTouched((prev) => ({ ...prev, agree: true }));
                  if (value) {
                    setErrors((prev) => {
                      const newErr = { ...prev };
                      delete newErr.agree;
                      return newErr;
                    });
                  }
                }}
              />
              <span>
                Tôi đồng ý với{" "}
                <a
                  href="#"
                  className="text-blue-600 underline ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Điều khoản & Chính sách
                </a>
              </span>
            </label>
            {touched.agree && errors.agree && (
              <p className="text-red-500 text-sm mt-1">{errors.agree}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isValidInputs}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          {/* Link login */}
          <p className="text-center text-sm mt-4">
            Đã có tài khoản?{" "}
            <Link to="/" className="text-blue-600 underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
