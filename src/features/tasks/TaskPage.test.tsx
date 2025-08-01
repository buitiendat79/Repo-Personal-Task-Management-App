import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TasksPage from "./TaskPage";
import { TestProviders } from "../../test/TestProviders";
import { useUser } from "@supabase/auth-helpers-react";
import { useTasks } from "./useTask";

// Mock Supabase user
vi.mock("@supabase/auth-helpers-react", async () => {
  const actual = await vi.importActual("@supabase/auth-helpers-react");
  return {
    ...actual,
    useUser: () => ({ id: "test-user-id" }),
  };
});

// Mock useUpdateTaskStatus
const mockUpdateTaskStatus = vi.fn();

vi.mock("./useTask", () => ({
  useTasks: () => ({
    data: {
      total: 10,
      data: [
        {
          id: "task-1",
          title: "Task mock",
          status: "To Do",
          priority: "High",
          deadline: "2025-08-01T00:00:00.000Z",
        },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpdateTaskStatus: () => ({
    mutate: mockUpdateTaskStatus,
  }),
}));

describe("TasksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hiển thị tiêu đề và nút tạo mới", () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    expect(screen.getByText("Danh sách Task")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ Tạo mới task/i })
    ).toBeInTheDocument();
  });

  it("nhập vào ô tìm kiếm sẽ thay đổi giá trị", async () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    const input = screen.getByPlaceholderText("Tìm kiếm task...");
    fireEvent.change(input, { target: { value: "task quan trọng" } });

    expect(input).toHaveValue("task quan trọng");
  });

  it("chọn filter Trạng thái và Ưu tiên", async () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    const statusSelect = screen.getByDisplayValue("Trạng thái");
    const prioritySelect = screen.getByDisplayValue("Ưu tiên");

    fireEvent.change(statusSelect, { target: { value: "Done" } });
    fireEvent.change(prioritySelect, { target: { value: "High" } });

    expect(statusSelect).toHaveValue("Done");
    expect(prioritySelect).toHaveValue("High");
  });

  it("nhấn checkbox sẽ gọi updateTaskStatus", async () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(
        { taskId: "task-1", status: "Done" },
        expect.any(Object)
      );
    });
  });

  it("phân trang hiển thị khi có nhiều task", async () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    const pageButtons = await screen.findAllByRole("button", {
      name: /^[0-9]+$/,
    });

    expect(pageButtons.length).toBeGreaterThan(1);
  });
});
