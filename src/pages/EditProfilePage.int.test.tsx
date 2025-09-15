import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import EditProfilePage from "./EditProfilePage";

// ---- Mock Layout ----
vi.mock("../layout/DashboardLayout", () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// ---- Mock navigate ----
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---- Mock supabase ----
const mockGetUser = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock("../api/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: (...args: any[]) => mockGetUser(...args),
      updateUser: (...args: any[]) => mockUpdateUser(...args),
    },
  },
}));

// ---- Mock setUser ----
vi.mock("../features/auth/AuthSlice", () => ({
  setUser: (payload: any) => ({ type: "auth/setUser", payload }),
}));

// ---- Store ----
const authReducer = (state = { user: null }, action: any) => {
  switch (action.type) {
    case "auth/setUser":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: null } },
  });

const renderPage = (store = makeStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>
    </Provider>
  );

// ---- Fixtures ----
const userInitial = {
  id: "u_1",
  email: "dat@example.com",
  created_at: "2023-01-01T00:00:00Z",
  user_metadata: { display_name: "Đạt Bùi" },
};

const userUpdated = {
  ...userInitial,
  user_metadata: { display_name: "Tên mới" },
};

// ---- Tests ----
describe("EditProfilePage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render form với dữ liệu từ Supabase", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: userInitial },
      error: null,
    });

    renderPage();

    expect(await screen.findByLabelText(/Họ tên/i)).toHaveValue("Đạt Bùi");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("dat@example.com");
  });

  it("update profile thành công", async () => {
    // Lần 1: load user ban đầu
    mockGetUser.mockResolvedValueOnce({
      data: { user: userInitial },
      error: null,
    });
    // Update OK
    mockUpdateUser.mockResolvedValueOnce({ data: {}, error: null });
    // Lần 2: refetch sau update
    mockGetUser.mockResolvedValueOnce({
      data: { user: userUpdated },
      error: null,
    });

    const store = makeStore();
    renderPage(store);

    // Đợi form load
    const nameInput = await screen.findByLabelText(/Họ tên/i);
    fireEvent.change(nameInput, { target: { value: "Tên mới" } });

    fireEvent.click(screen.getByRole("button", { name: /Lưu thay đổi/i }));

    // Gọi updateUser đúng payload
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { display_name: "Tên mới" },
      });
    });

    // UI hiển thị message thành công
    expect(await screen.findByText(/Cập nhật thành công/i)).toBeInTheDocument();

    // Redux đã được cập nhật
    const state = store.getState();
    expect(state.auth.user.display_name).toBe("Tên mới");
  });

  it("update profile thất bại", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: userInitial },
      error: null,
    });
    mockUpdateUser.mockResolvedValueOnce({
      data: null,
      error: { message: "Update failed" },
    });

    renderPage();

    await screen.findByLabelText(/Họ tên/i);

    fireEvent.click(screen.getByRole("button", { name: /Lưu thay đổi/i }));

    expect(await screen.findByText(/Update failed/i)).toBeInTheDocument();
  });

  it("cancel điều hướng về /profile", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: userInitial },
      error: null,
    });

    renderPage();

    await screen.findByLabelText(/Họ tên/i);

    fireEvent.click(screen.getByRole("button", { name: /Hủy/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});
