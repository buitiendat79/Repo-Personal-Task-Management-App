import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ResetPasswordPage from "./ResetPasswordPage";
import { supabase } from "../api/supabaseClient";
import { BrowserRouter } from "react-router-dom";

// Mock supabase
vi.mock("../../api/supabaseClient", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

const renderWithRouter = (ui: React.ReactNode) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form inputs and buttons", () => {
    renderWithRouter(<ResetPasswordPage />);
    expect(
      screen.getByRole("heading", { name: /reset your password/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu mới/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nhập lại mật khẩu mới/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Lưu mật khẩu mới/i })
    ).toBeInTheDocument();
  });

  it("shows error when fields are empty", async () => {
    renderWithRouter(<ResetPasswordPage />);
    fireEvent.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));

    expect(
      await screen.findByText(/Vui lòng nhập mật khẩu mới/i)
    ).toBeVisible();
    expect(
      await screen.findByText(/Vui lòng nhập lại mật khẩu/i)
    ).toBeVisible();
  });

  it("shows error if password and confirm do not match", async () => {
    renderWithRouter(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/Mật khẩu mới/i), {
      target: { value: "Abcdef1!" },
    });
    fireEvent.change(screen.getByLabelText(/Nhập lại mật khẩu mới/i), {
      target: { value: "Different1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));

    expect(await screen.findByText(/Mật khẩu không khớp/i)).toBeVisible();
  });

  it("calls supabase.updateUser and shows success message", async () => {
    (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

    renderWithRouter(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/Mật khẩu mới/i), {
      target: { value: "Abcdef1!" },
    });
    fireEvent.change(screen.getByLabelText(/Nhập lại mật khẩu mới/i), {
      target: { value: "Abcdef1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: "Abcdef1!",
      });
    });

    expect(
      await screen.findByText(/Đặt lại mật khẩu thành công/i)
    ).toBeInTheDocument();
  });

  it("shows error if supabase.updateUser fails", async () => {
    (supabase.auth.updateUser as any).mockResolvedValue({
      error: { message: "Update failed" },
    });

    renderWithRouter(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText(/Mật khẩu mới/i), {
      target: { value: "Abcdef1!" },
    });
    fireEvent.change(screen.getByLabelText(/Nhập lại mật khẩu mới/i), {
      target: { value: "Abcdef1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Lưu mật khẩu mới/i }));

    expect(await screen.findByText(/Update failed/i)).toBeVisible();
  });
});
