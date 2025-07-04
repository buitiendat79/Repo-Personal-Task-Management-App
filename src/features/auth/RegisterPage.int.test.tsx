import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./RegisterPage";
import { store } from "../../app/store";
import { supabase } from "../../api/supabaseClient";

vi.mock("./../../api/supabaseClient", () => {
  return {
    supabase: {
      auth: {
        signUp: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

describe("RegisterPage Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    supabase.from.mockImplementation((table) => {
      if (table === "users") {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [] }),
          }),
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [] }),
        }),
      };
    });

    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
      error: null,
    });
  });

  function renderComponent() {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </Provider>
    );
  }

  test("renders form inputs and submit button disabled initially", () => {
    renderComponent();

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mật khẩu$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nhập lại mật khẩu/i)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Tôi đồng ý/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Đăng ký/i })).toBeDisabled();
  });

  test("shows validation errors on blur and disables submit", async () => {
    renderComponent();

    fireEvent.blur(screen.getByLabelText(/Email/i));
    expect(await screen.findByText("Vui lòng nhập email")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/Email/i));
    await userEvent.type(screen.getByLabelText(/Email/i), "invalid-email");
    fireEvent.blur(screen.getByLabelText(/Email/i));

    const emailErrors = await screen.findAllByText(/Email không hợp lệ/i);
    expect(emailErrors.length).toBeGreaterThan(0);

    await userEvent.type(screen.getByLabelText(/^Mật khẩu$/i), "123");
    fireEvent.blur(screen.getByLabelText(/^Mật khẩu$/i));
    expect(
      await screen.findByText(/Mật khẩu tối thiểu 8 ký tự/i)
    ).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText(/Nhập lại mật khẩu/i),
      "different"
    );
    fireEvent.blur(screen.getByLabelText(/Nhập lại mật khẩu/i));
    expect(await screen.findByText(/Mật khẩu không khớp/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Đăng ký/i })).toBeDisabled();
  });

  test("enables submit button when form is valid and checkbox checked", async () => {
    renderComponent();

    await userEvent.type(screen.getByLabelText(/Email/i), "test@example.com");
    fireEvent.blur(screen.getByLabelText(/Email/i));

    await userEvent.type(screen.getByLabelText(/^Mật khẩu$/i), "P@ssw0rd!");
    fireEvent.blur(screen.getByLabelText(/^Mật khẩu$/i));

    await userEvent.type(
      screen.getByLabelText(/Nhập lại mật khẩu/i),
      "P@ssw0rd!"
    );
    fireEvent.blur(screen.getByLabelText(/Nhập lại mật khẩu/i));

    userEvent.click(screen.getByRole("checkbox", { name: /Tôi đồng ý/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Đăng ký/i })).toBeEnabled();
    });
  });

  test("submits form successfully and shows success message", async () => {
    renderComponent();

    await userEvent.type(screen.getByLabelText(/Email/i), "test@example.com");
    fireEvent.blur(screen.getByLabelText(/Email/i));

    await userEvent.type(screen.getByLabelText(/^Mật khẩu$/i), "P@ssw0rd!");
    fireEvent.blur(screen.getByLabelText(/^Mật khẩu$/i));

    await userEvent.type(
      screen.getByLabelText(/Nhập lại mật khẩu/i),
      "P@ssw0rd!"
    );
    fireEvent.blur(screen.getByLabelText(/Nhập lại mật khẩu/i));

    userEvent.click(screen.getByRole("checkbox", { name: /Tôi đồng ý/i }));

    userEvent.click(screen.getByRole("button", { name: /Đăng ký/i }));

    expect(await screen.findByText(/Đăng ký thành công/i)).toBeInTheDocument();
  });

  test("shows error if email already registered", async () => {
    supabase.from.mockImplementationOnce(() => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [{ email: "test@example.com" }] }),
      }),
    }));

    renderComponent();

    await userEvent.type(screen.getByLabelText(/Email/i), "test@example.com");
    fireEvent.blur(screen.getByLabelText(/Email/i));

    expect(
      await screen.findByText("Email đã được đăng ký")
    ).toBeInTheDocument();
  });
});
