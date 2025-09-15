import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "./ForgotPasswordPage";
import { supabase } from "../../../api/supabaseClient";
import { BrowserRouter } from "react-router-dom";

// Mock navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock SuccessModal
vi.mock("./SuccessModal", () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="success-modal">
      SuccessModal
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock supabase
const resetPasswordForEmailMock = vi.fn();
(supabase.auth.resetPasswordForEmail as any) = resetPasswordForEmailMock;

const renderPage = () =>
  render(
    <BrowserRouter>
      <ForgotPasswordPage />
    </BrowserRouter>
  );

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and input", () => {
    renderPage();
    expect(screen.getByText("Quên mật khẩu")).toBeInTheDocument();
    expect(screen.getByLabelText("Nhập email đã đăng ký")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gửi liên kết đặt lại" })
    ).toBeInTheDocument();
  });

  it("shows error when email is empty", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));
    expect(await screen.findByText("Vui lòng nhập email.")).toBeInTheDocument();
  });

  it("shows error when email format is invalid", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Nhập email đã đăng ký"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));
    expect(await screen.findByText("Email không hợp lệ.")).toBeInTheDocument();
  });

  it("calls supabase and shows success modal on success", async () => {
    resetPasswordForEmailMock.mockResolvedValueOnce({ error: null });

    renderPage();
    fireEvent.change(screen.getByLabelText("Nhập email đã đăng ký"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));

    expect(resetPasswordForEmailMock).toHaveBeenCalledWith("test@example.com");

    expect(await screen.findByTestId("success-modal")).toBeInTheDocument();
  });

  it("shows error from supabase on failure", async () => {
    resetPasswordForEmailMock.mockResolvedValueOnce({
      error: { message: "Email not found" },
    });

    renderPage();
    fireEvent.change(screen.getByLabelText("Nhập email đã đăng ký"), {
      target: { value: "fail@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));

    expect(await screen.findByText("Email not found")).toBeInTheDocument();
  });

  it("disables button and shows loading text while submitting", async () => {
    let resolver: (v: any) => void;
    const promise = new Promise((resolve) => (resolver = resolve));
    resetPasswordForEmailMock.mockReturnValueOnce(promise);

    renderPage();
    fireEvent.change(screen.getByLabelText("Nhập email đã đăng ký"), {
      target: { value: "loading@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Gửi/i }));

    expect(screen.getByRole("button", { name: "Đang gửi..." })).toBeDisabled();

    // finish async
    resolver!({ error: null });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Gửi liên kết đặt lại" })
      ).toBeEnabled()
    );
  });
});
