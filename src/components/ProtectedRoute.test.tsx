import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { supabase } from "../api/supabaseClient";
import { setUser } from "../features/auth/AuthSlice";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    Navigate: vi.fn(() => <div>Redirected to Login</div>),
  };
});

vi.mock("../api/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("../features/auth/AuthSlice", () => ({
  setUser: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("ProtectedRoute", () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    (useDispatch as vi.Mock).mockReturnValue(mockDispatch);
  });

  test("shouldShowLoading_whenCheckingSession", async () => {
    // Arrange
    (useSelector as vi.Mock).mockReturnValue(null);
    (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    render(
      <ProtectedRoute>
        <div>Private Content</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText("Đang kiểm tra phiên đăng nhập...")
    ).toBeInTheDocument();
  });

  test("shouldRenderChildren_whenUserExists", async () => {
    const mockUser = { id: "123", email: "user@example.com" };
    (useSelector as vi.Mock).mockReturnValue(mockUser);
    (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({
      data: { session: { user: mockUser } },
    });

    render(
      <ProtectedRoute>
        <div>Private Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText("Private Content")).toBeInTheDocument();
    });

    expect(mockDispatch).toHaveBeenCalledWith(setUser(mockUser));
  });

  test("shouldRedirect_whenNoUserAndNoSession", async () => {
    (useSelector as vi.Mock).mockReturnValue(null);
    (supabase.auth.getSession as vi.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    render(
      <ProtectedRoute>
        <div>Private Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText("Redirected to Login")).toBeInTheDocument();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
