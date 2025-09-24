import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordPage from "./ResetPasswordPage";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mock supabase (chỉnh path nếu cần cho project của bạn)
vi.mock("../api/supabaseClient", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with 2 password inputs", () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    // dùng exact text để tránh trùng với "Nhập lại mật khẩu mới"
    expect(screen.getByLabelText("Mật khẩu mới")).toBeInTheDocument();
    expect(screen.getByLabelText("Nhập lại mật khẩu mới")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Lưu mật khẩu mới/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors when fields are empty", async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));

    expect(
      await screen.findByText("Vui lòng nhập mật khẩu mới")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Vui lòng nhập lại mật khẩu")
    ).toBeInTheDocument();
  });

  it("shows error when confirm password does not match", async () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
      target: { value: "Wrong123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));

    expect(await screen.findByText("Mật khẩu không khớp")).toBeInTheDocument();
  });

  it("submits successfully and shows success message", async () => {
    const { supabase } = await import("../api/supabaseClient");
    (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));

    // chờ gọi API
    await waitFor(() =>
      expect(supabase.auth.updateUser as any).toHaveBeenCalledWith({
        password: "Password123!",
      })
    );

    expect(
      await screen.findByText(
        "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
      )
    ).toBeInTheDocument();
  });

  it("navigates back when clicking Hủy", () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Hủy/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
