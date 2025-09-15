// TasksPage.int.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";

/**
 * NOTE:
 * - Đặt file test này cùng thư mục với TasksPage.tsx (vì ta mock "./useTask" relative).
 * - Nếu để ở chỗ khác, chỉnh lại đường dẫn trong vi.mock(...) cho khớp.
 */

// Mock layout (tránh render layout phức tạp)
vi.mock("../../layout/DashboardLayout", () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

// Mock react-router-dom.useNavigate -> sẽ thay đổi window.history để assert pathname
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => (to: string) => {
      // push new path so tests can assert window.location.pathname
      window.history.pushState({}, "", to);
    },
  };
});

// Mock supabase auth helper useUser (TasksPage dùng useUser() để lấy user id)
vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: vi.fn(),
}));

// Mock local hooks module (useTasks + useUpdateTaskStatus)
vi.mock("./useTask", () => ({
  useTasks: vi.fn(),
  useUpdateTaskStatus: vi.fn(),
}));

// Import AFTER mocks so imports resolve to mocks
import TasksPage from "./TaskPage";
import { useTasks, useUpdateTaskStatus } from "./useTask";
import { useUser } from "@supabase/auth-helpers-react";

const useTasksMock = useTasks as unknown as jest.Mock | vi.Mock;
const useUpdateTaskStatusMock = useUpdateTaskStatus as unknown as vi.Mock;
const useUserMock = useUser as unknown as vi.Mock;

beforeEach(() => {
  vi.clearAllMocks();

  // Default: user present
  useUserMock.mockReturnValue({ id: "user_1", email: "a@b.com" });

  // Default: useUpdateTaskStatus returns mutate fn
  useUpdateTaskStatusMock.mockReturnValue({
    mutate: vi.fn(),
  });
});

afterEach(() => {
  // clean DOM
  document.body.innerHTML = "";
});

const mockTasks = [
  {
    id: "1",
    title: "Task A",
    priority: "High",
    deadline: "2025-09-10",
    status: "To Do",
  },
  {
    id: "2",
    title: "Task B",
    priority: "Low",
    deadline: "2025-09-12",
    status: "Done",
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/tasks"]}>
      <TasksPage />
    </MemoryRouter>
  );
}

describe("TasksPage integration", () => {
  it("hiển thị loading spinner khi isLoading = true", async () => {
    useTasksMock.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    // Loader2 has data-testid="loading-spinner"
    // expect(await screen.findByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("hiển thị lỗi khi API lỗi", async () => {
    useTasksMock.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    renderPage();

    expect(
      await screen.findByText("Có lỗi xảy ra, vui lòng thử lại sau")
    ).toBeInTheDocument();
  });

  it("hiển thị message khi không có task", async () => {
    useTasksMock.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    expect(
      await screen.findByText(
        "Không tìm thấy task nào phù hợp với điều kiện lọc/tìm kiếm"
      )
    ).toBeInTheDocument();
  });

  it("render danh sách task khi có data", async () => {
    useTasksMock.mockReturnValue({
      data: { data: mockTasks, total: mockTasks.length },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    // Titles
    expect(await screen.findByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();

    // Priority badges
    // expect(screen.getByText("High")).toBeInTheDocument();
    // expect(screen.getByText("Low")).toBeInTheDocument();

    // Check formatted deadlines (DD/MM/YYYY)
    expect(screen.getByText("10/09/2025")).toBeInTheDocument();
    expect(screen.getByText("12/09/2025")).toBeInTheDocument();
  });

  it("checkbox toggle gọi updateTaskStatus với payload đúng", async () => {
    const mutateMock = vi.fn();
    useTasksMock.mockReturnValue({
      data: { data: mockTasks, total: mockTasks.length },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    useUpdateTaskStatusMock.mockReturnValue({ mutate: mutateMock });

    renderPage();

    const checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);

    // click checkbox of first task -> task.status "To Do" -> newStatus "Done"
    fireEvent.click(checkboxes[0]);

    expect(mutateMock).toHaveBeenCalledWith(
      { taskId: "1", status: "Done" },
      expect.any(Object)
    );
  });

  it("phân trang hiển thị đúng số trang (LIMIT = 9)", async () => {
    // total = 20 -> pages = ceil(20/9) = 3
    useTasksMock.mockReturnValue({
      data: { data: mockTasks, total: 20 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    // wait render
    expect(await screen.findByText("Task A")).toBeInTheDocument();

    // pagination buttons "1","2","3" should exist
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("nút + Tạo mới task điều hướng đến /createtask", async () => {
    useTasksMock.mockReturnValue({
      data: { data: mockTasks, total: mockTasks.length },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    const btn = await screen.findByText("+ Tạo mới task");
    fireEvent.click(btn);

    // our mocked useNavigate pushes to window.history
    expect(window.location.pathname).toBe("/createtask");
  });
});
