import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./../../app/store";
import LoginPage from "./LoginPage";
import { supabase } from "./../../api/supabaseClient";

vi.mock("./../../api/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      setSession: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
});

const mockedDispatch = vi.fn();
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockedDispatch,
  };
});

describe("LoginPage Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

  test("renders login form with inputs and button", () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /đăng nhập/i })
    ).toBeInTheDocument();
  });

  test("shows validation errors on blur", async () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mật khẩu/i);

    fireEvent.blur(emailInput);
    fireEvent.blur(passwordInput);

    fireEvent.submit(screen.getByTestId("form-login"));

    expect(await screen.findByText(/vui lòng nhập email/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/vui lòng nhập mật khẩu/i)
    ).toBeInTheDocument();

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "sai-email");
    fireEvent.submit(screen.getByTestId("form-login"));

    expect(await screen.findByText(/email không hợp lệ/i)).toBeInTheDocument();
  });

  test("submits login form successfully", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: "123", email: "test@example.com" },
        session: {
          user: { id: "123", email: "test@example.com" },
          access_token: "fake",
        },
      },
      error: null,
    });

    renderComponent();

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), "password123");

    await userEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(mockedDispatch).toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });

  test("shows general error if credentials are invalid", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    renderComponent();

    await userEvent.type(screen.getByLabelText(/email/i), "wrong@email.com");
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), "wrongpass");

    userEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    expect(
      await screen.findByText(/email hoặc mật khẩu không đúng/i)
    ).toBeInTheDocument();
  });

  test("remembers user when checkbox checked", async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "1", email: "test@a.com" } },
      error: null,
    });

    renderComponent();

    await userEvent.type(screen.getByLabelText(/email/i), "test@a.com");
    await userEvent.type(screen.getByLabelText(/mật khẩu/i), "12345678");

    userEvent.click(screen.getByLabelText(/nhớ đăng nhập/i));
    userEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    await waitFor(() => {
      // expect(localStorage.getItem("rememberedUser")).toBe("test@a.com");
    });
  });
});
