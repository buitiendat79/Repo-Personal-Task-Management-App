import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ProfilePage from "../pages/ProfilePage";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../api/supabaseClient";
import { BrowserRouter } from "react-router-dom";

// Mock Redux
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

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

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProfilePage", () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDispatch as any).mockReturnValue(mockDispatch);
  });

  it("hiển thị loading ban đầu", () => {
    (useSelector as any).mockReturnValue(null);
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("hiển thị thông báo khi không có user", async () => {
    (useSelector as any).mockReturnValue(null);
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Không tìm thấy thông tin người dùng")
      ).toBeInTheDocument();
    });
  });

  it("hiển thị thông tin user từ Redux", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      display_name: "Dat Bui",
      created_at: "2025-01-01T00:00:00Z",
    };
    (useSelector as any).mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dat Bui")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText(/Số task đã tạo:/)).toBeInTheDocument();
    });
  });

  it("navigate đúng khi bấm nút", async () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      display_name: "Tester",
      created_at: "2025-01-01T00:00:00Z",
    };
    (useSelector as any).mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const editBtn = screen.getByText("Sửa thông tin");
      fireEvent.click(editBtn);
      expect(mockNavigate).toHaveBeenCalledWith("/editprofile");

      const pwBtn = screen.getByText("Đổi mật khẩu");
      fireEvent.click(pwBtn);
      expect(mockNavigate).toHaveBeenCalledWith("/change_password");
    });
  });
});
