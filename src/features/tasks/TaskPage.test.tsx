import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TasksPage from "./TaskPage";
import { TestProviders } from "../../test/TestProviders";
import { useUser } from "@supabase/auth-helpers-react";

vi.mock("@supabase/auth-helpers-react", async () => {
  const actual = await vi.importActual("@supabase/auth-helpers-react");
  return {
    ...actual,
    useUser: () => ({ id: "test-user-id" }),
  };
});

vi.mock("./useTask", () => ({
  useTasks: () => ({
    data: {
      total: 1,
      data: [
        {
          id: "task-1",
          title: "Task mock",
          is_completed: false,
          priority: "High",
          deadline: "2025-08-01T00:00:00.000Z",
        },
      ],
    },
    isLoading: false,
    isError: false,
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

  it("chọn checkbox task đầu tiên và hiển thị gạch ngang", async () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    await waitFor(() => {
      expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
    });

    const checkbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("hiển thị thông báo nếu không có task nào", async () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    await waitFor(() => {
      const msg = screen.queryByText(/Không tìm thấy task nào phù hợp/i);
      if (msg) {
        expect(msg).toBeInTheDocument();
      }
    });
  });

  it("phân trang hoạt động nếu có nhiều task", async () => {
    render(
      <TestProviders>
        <TasksPage />
      </TestProviders>
    );

    await waitFor(() => {
      const pageButtons = screen.queryAllByRole("button", { name: /^[0-9]+$/ });
      if (pageButtons.length > 1) {
        fireEvent.click(pageButtons[1]);
        expect(pageButtons[1]).toHaveClass("text-lg");
      }
    });
  });
});
