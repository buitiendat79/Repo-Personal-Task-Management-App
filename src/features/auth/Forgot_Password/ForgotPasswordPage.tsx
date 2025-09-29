import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabaseClient";
import SuccessModal from "./SuccessModal";
import { FiMail } from "react-icons/fi";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      const { error: supaError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: "http://localhost:5173/reset-password",
        }
      );

      if (supaError) {
        setError(
          supaError.message || "Gửi liên kết thất bại. Vui lòng thử lại."
        );
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      console.error("ForgotPassword error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Quên mật khẩu</h1>
        <p className="text-gray-600 text-center mb-6">
          Nhập email đã đăng ký để đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="forgot-email"
              className="flex items-center text-gray-700 mb-2 select-none"
            >
              <FiMail className="mr-2 text-gray-500" size={18} />
              <span className="text-sm">Nhập email đã đăng ký</span>
            </label>

            <input
              id="forgot-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "forgot-email-error" : undefined}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder=""
            />
          </div>

          {error && (
            <p id="forgot-email-error" className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium transition
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>

      {isSuccess && (
        <SuccessModal
          onClose={() => {
            setIsSuccess(false);
            navigate("/");
          }}
        />
      )}
    </div>
  );
}
