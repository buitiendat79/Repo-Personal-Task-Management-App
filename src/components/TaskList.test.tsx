import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useTasks, useUpdateTaskStatus } from "../features/tasks/useTask";
import TaskList from "../components/TaskList";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: vi.fn(),
}));

vi.mock("../features/tasks/useTask", () => ({
  useTasks: vi.fn(),
  useUpdateTaskStatus: vi.fn(),
}));

describe("TaskList Component", () => {
  const mockNavigate = vi.fn();
  const mockMutate = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
    (useUpdateTaskStatus as vi.Mock).mockReturnValue({ mutate: mockMutate });
    (useUser as vi.Mock).mockReturnValue({ id: "user-1" });
  });

  // Case 1:
  it("render_shouldShowLoading_whenDataIsLoading", () => {
    (useUser as vi.Mock).mockReturnValue({ id: "user-1" });
    (useTasks as vi.Mock).mockReturnValue({ isLoading: true });
    render(<TaskList />);
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  // CASE 2
  it("render_shouldShowTaskRows_whenDataAvailable", () => {
    (useTasks as vi.Mock).mockReturnValue({
      isLoading: false,
      data: {
        data: [
          {
            id: "1",
            title: "Task A",
            priority: "High",
            status: "To Do",
            deadline: "2025-10-20",
          },
        ],
      },
    });

    render(<TaskList />);

    const taskTitles = screen.getAllByText("Task A");
    expect(taskTitles).toHaveLength(2); // responsive
    expect(screen.getAllByText("Cao")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/20\/10\/2025/)[0]).toBeInTheDocument();
  });

  // CASE 3
  it("click_shouldNavigateToCreateTask_whenAddButtonClicked", () => {
    (useTasks as vi.Mock).mockReturnValue({
      isLoading: false,
      data: { data: [] },
    });

    render(<TaskList />);

    fireEvent.click(screen.getByRole("button", { name: /\+ thêm task/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/createtask");
  });

  // CASE 4
  it("toggleStatus_shouldCallUpdateTask_whenCheckboxClicked", async () => {
    const mockMutate = vi.fn();
    const mockRefetch = vi.fn();

    (useTasks as vi.Mock).mockReturnValue({
      isLoading: false,
      refetch: mockRefetch,
      data: {
        data: [
          {
            id: "1",
            title: "Task A",
            priority: "Low",
            status: "To Do",
            deadline: "2025-10-22",
          },
        ],
      },
    });

    (useUpdateTaskStatus as vi.Mock).mockReturnValue({ mutate: mockMutate });

    render(<TaskList />);

    //  Có 2 node cùng text "Task A" → lấy node chính xác trong hàng
    const titleNodes = screen.getAllByText("Task A");
    expect(titleNodes.length).toBeGreaterThan(0);

    // Thường node thứ 1 là text trong cột chính (font-semibold)
    const titleNode =
      titleNodes.find((n) => n.className.includes("font-semibold")) ??
      titleNodes[0];

    expect(titleNode).toBeInTheDocument();

    // Lấy container của task (tr hoặc div)
    const taskRow =
      titleNode.closest("tr") ??
      titleNode.closest("div") ??
      titleNode.parentElement;

    expect(taskRow).toBeTruthy();

    // Lấy checkbox bên trong đúng hàng
    const checkbox = within(taskRow as HTMLElement).getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();

    // Act: click checkbox
    await userEvent.click(checkbox);

    // Assert: gọi mutate với payload đúng
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: "1", status: "Done" }),
      expect.any(Object)
    );
  });

  // CASE 5
  it("click_shouldNavigateToTaskDetail_whenViewButtonClicked", async () => {
    // Arrange
    const mockNavigate = vi.fn();
    const mockRefetch = vi.fn();

    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
    (useTasks as vi.Mock).mockReturnValue({
      isLoading: false,
      refetch: mockRefetch,
      data: {
        data: [
          {
            id: "1",
            title: "Task A",
            priority: "High",
            status: "To Do",
            deadline: "2025-10-22",
          },
        ],
      },
    });

    // 👇 Giả màn hình lớn để hiển thị table (desktop)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1200,
    });
    window.dispatchEvent(new Event("resize"));

    render(<TaskList />);

    // Act
    const table = screen.getByRole("table"); // chỉ query trong table (desktop)
    const taskRow = within(table).getByText("Task A").closest("tr");
    expect(taskRow).toBeTruthy();

    const viewButton = within(taskRow as HTMLElement).getByRole("button", {
      name: /xem/i,
    });
    expect(viewButton).toBeInTheDocument();

    await userEvent.click(viewButton);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/tasks/1");
  });
});
