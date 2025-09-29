import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";
import { MemoryRouter } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import { Provider } from "react-redux";
import { store } from "../../app/store";

vi.mock("../../api/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );

  test("hiển thị đúng các trường input và nút", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /nhớ đăng nhập/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /đăng nhập/i })
    ).toBeInTheDocument();
  });

  test("báo lỗi khi submit form mà để trống các trường", async () => {
    renderLogin();
    const btn = screen.getByRole("button", { name: /đăng nhập/i });
    fireEvent.click(btn);

    expect(await screen.findByText(/vui lòng nhập email/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/vui lòng nhập mật khẩu/i)
    ).toBeInTheDocument();
  });

  test("báo lỗi email không hợp lệ", async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mật khẩu/i);

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "invalid-email");
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "12345678");

    fireEvent.submit(screen.getByTestId("form-login"));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
  });

  test("submit thành công khi nhập đúng", async () => {
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;
    mockSignIn.mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    });

    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mật khẩu/i);
    const btn = screen.getByRole("button", { name: /đăng nhập/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "Password1!");

    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password1!",
      });
    });
  });

  test("hiện lỗi chung khi đăng nhập sai", async () => {
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mật khẩu/i);
    const btn = screen.getByRole("button", { name: /đăng nhập/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "wrongpassword");

    fireEvent.click(btn);

    expect(
      await screen.findByText(/email hoặc mật khẩu không đúng/i)
    ).toBeInTheDocument();
  });
});
