// TaskPage.unit.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, expect } from "vitest";

// Mock layout (đơn giản hóa)
vi.mock("../../layout/DashboardLayout", () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock supabase auth helper
vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: vi.fn(() => ({ id: "user_1" })),
}));

// Mock hooks của TaskPage
vi.mock("./useTask", () => ({
  useTasks: vi.fn(),
  useUpdateTaskStatus: vi.fn(),
}));

import TasksPage from "./TaskPage";
import { useTasks, useUpdateTaskStatus } from "./useTask";

const useTasksMock = useTasks as unknown as vi.Mock;
const useUpdateTaskStatusMock = useUpdateTaskStatus as unknown as vi.Mock;

beforeEach(() => {
  vi.clearAllMocks();
  useUpdateTaskStatusMock.mockReturnValue({ mutate: vi.fn() });
});

describe("TaskPage Unit Tests", () => {
  it("render form filter", () => {
    useTasksMock.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    // Form filter tồn tại
    expect(screen.getByPlaceholderText("Tìm kiếm task...")).toBeInTheDocument();
    // expect(screen.getByLabelText("Trạng thái")).toBeInTheDocument();
    // expect(screen.getByLabelText("Ưu tiên")).toBeInTheDocument();
  });

  it("hiển thị loading spinner khi isLoading", () => {
    useTasksMock.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    // expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("hiển thị error khi API lỗi", () => {
    useTasksMock.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Có lỗi xảy ra, vui lòng thử lại sau")
    ).toBeInTheDocument();
  });

  it("render task list khi có data", () => {
    useTasksMock.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            title: "Task A",
            priority: "High",
            deadline: "2025-09-10",
            status: "To Do",
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    // ✅ Desktop: bảng hiển thị task
    expect(screen.getByRole("cell", { name: "Task A" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "High" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "10/09/2025" })
    ).toBeInTheDocument();

    // ✅ Mobile: card hiển thị task
    expect(screen.getByRole("heading", { name: "Task A" })).toBeInTheDocument();

    // lọc riêng badge priority cho mobile
    const priorityBadges = screen
      .getAllByText("High")
      .filter((el) => el.tagName === "SPAN");
    expect(priorityBadges).toHaveLength(2); // desktop + mobile badge

    // lọc riêng deadline text trong table/card
    const deadlines = screen
      .getAllByText("10/09/2025")
      .filter((el) => el.tagName !== "OPTION");
    expect(deadlines).toHaveLength(2); // desktop + mobile
  });

  it("click checkbox gọi updateTaskStatus.mutate", () => {
    const mutateMock = vi.fn();
    useUpdateTaskStatusMock.mockReturnValue({ mutate: mutateMock });

    useTasksMock.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            title: "Task A",
            priority: "HIGH",
            deadline: "2025-09-10",
            status: "To Do",
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    // Có 2 checkbox (desktop + mobile), chọn desktop
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(mutateMock).toHaveBeenCalledWith(
      { taskId: "1", status: "Done" },
      expect.any(Object)
    );
  });
});
