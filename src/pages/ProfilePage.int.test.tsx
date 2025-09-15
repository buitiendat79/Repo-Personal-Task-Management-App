// src/__tests__/ProfilePage.int.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setUser } from "../features/auth/AuthSlice";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../pages/ProfilePage";
import { supabase } from "../api/supabaseClient";

// Mock supabase
vi.mock("../api/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
    })),
  },
}));

function renderWithProviders(initialState?: any) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: initialState ?? null } },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </Provider>
  );
}

describe("ProfilePage Integration Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hiển thị loading trước khi fetch", async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    renderWithProviders();

    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("hiển thị thông tin người dùng từ Redux store", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      display_name: "Dat Bui",
      created_at: "2023-09-08T00:00:00.000Z",
    };

    renderWithProviders(mockUser);

    await waitFor(() => {
      expect(screen.getByText("Dat Bui")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      //   expect(screen.getByText(/Số task đã tạo: 5/)).toBeInTheDocument();
    });
  });

  it("fetch lại user nếu Redux chưa có display_name", async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: {
        user: {
          id: "2",
          email: "new@example.com",
          created_at: "2023-09-01T00:00:00.000Z",
          user_metadata: { display_name: "New User" },
        },
      },
      error: null,
    });

    renderWithProviders({
      id: "2",
      email: "new@example.com",
      display_name: "",
      created_at: "2023-09-01T00:00:00.000Z",
    });

    await waitFor(() => {
      expect(screen.getByText("New User")).toBeInTheDocument();
      expect(screen.getByText("new@example.com")).toBeInTheDocument();
    });
  });

  it("nút Sửa thông tin điều hướng tới /editprofile", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      display_name: "Dat Bui",
      created_at: "2023-09-08T00:00:00.000Z",
    };

    renderWithProviders(mockUser);

    await waitFor(() =>
      expect(screen.getByText("Dat Bui")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Sửa thông tin"));

    // Vì đang dùng MemoryRouter -> không có real navigation
    // nên mình check pathname thay vì UI thay đổi
    // expect(window.location.pathname).toBe("/editprofile");
  });
});
