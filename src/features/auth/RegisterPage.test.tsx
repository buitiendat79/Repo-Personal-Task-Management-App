import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./RegisterPage";
import { vi } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../../app/store";

vi.mock("./../../api/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [] }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "123", email: "test@example.com" } },
        error: null,
      }),
    },
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}

describe("RegisterPage", () => {
  test("hiển thị đúng các trường input", () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mật khẩu$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nhập lại mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /đăng ký/i })
    ).toBeInTheDocument();
  });

  test("hiển thị lỗi nếu không nhập gì", async () => {
    renderWithProviders(<RegisterPage />);
    const emailInput = screen.getByLabelText(/email/i);
    emailInput.focus();
    emailInput.blur();

    expect(await screen.findByText(/vui lòng nhập email/i)).toBeInTheDocument();
  });

  test("báo lỗi khi email sai định dạng", async () => {
    renderWithProviders(<RegisterPage />);
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "sai-email");
    emailInput.blur();

    expect(await screen.findByText(/email không hợp lệ/i)).toBeInTheDocument();
  });

  test("nút Đăng ký bị disable khi thiếu thông tin", async () => {
    renderWithProviders(<RegisterPage />);
    const button = screen.getByRole("button", { name: /đăng ký/i });
    expect(button).toBeDisabled();
  });

  test("submit thành công khi nhập đúng", async () => {
    renderWithProviders(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^mật khẩu$/i), "Test123!");
    await userEvent.type(
      screen.getByLabelText(/nhập lại mật khẩu/i),
      "Test123!"
    );
    await userEvent.click(screen.getByRole("checkbox"));

    const button = screen.getByRole("button", { name: /đăng ký/i });
    await waitFor(() => expect(button).toBeEnabled());

    await userEvent.click(button);

    expect(await screen.findByText(/đăng ký thành công/i)).toBeInTheDocument();
  });
});
