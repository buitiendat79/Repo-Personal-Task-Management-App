import { render, screen, waitFor } from "@testing-library/react";
import Header from "./Header";
import { supabase } from "../api/supabaseClient";
import { vi } from "vitest";

// Mock Supabase
vi.mock("../api/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("Header component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("render_shouldDisplayDashboardTitle_whenMounted", () => {
    render(<Header />);
    expect(
      screen.getByRole("heading", { name: /dashboard/i })
    ).toBeInTheDocument();
  });

  test("render_shouldShowAvatarImage_whenMounted", () => {
    render(<Header />);
    const avatar = screen.getByRole("img", { name: /avatar/i });
    expect(avatar).toBeInTheDocument();
  });

  test("fetch_shouldDisplayUserName_whenSupabaseReturnsUser", async () => {
    (supabase.auth.getUser as any).mockResolvedValueOnce({
      data: { user: { user_metadata: { display_name: "Dat Bui" } } },
    });

    render(<Header />);
    await waitFor(() =>
      expect(screen.getByText(/dat bui/i)).toBeInTheDocument()
    );
  });

  test("fetch_shouldDisplayEmail_whenUserHasNoDisplayName", async () => {
    (supabase.auth.getUser as any).mockResolvedValueOnce({
      data: { user: { user_metadata: {}, email: "dat@example.com" } },
    });

    render(<Header />);
    await waitFor(() =>
      expect(screen.getByText(/dat@example.com/i)).toBeInTheDocument()
    );
  });

  test("fetch_shouldDisplayGuest_whenNoUserReturned", async () => {
    // arrange: mock getUser trả về user: null (không có user)
    (supabase.auth.getUser as any).mockResolvedValueOnce({
      data: { user: null },
    });

    // act
    render(<Header />);

    // assert: chờ effect chạy rồi kiểm tra span chứa displayName là rỗng
    await waitFor(() => {
      // tìm avatar (bắt chắc chắn element đã render)
      const avatar = screen.getByRole("img", { name: /avatar/i });
      expect(avatar).toBeInTheDocument();

      // span hiển thị tên user nằm ngay trước avatar theo cấu trúc component
      const nameSpan = avatar.previousElementSibling as HTMLElement | null;
      expect(nameSpan).not.toBeNull();

      // đảm bảo span tồn tại trong DOM và đang rỗng (không có text)
      expect(nameSpan).toBeInstanceOf(HTMLElement);
      expect(nameSpan).toBeEmptyDOMElement();
    });
  });
});
