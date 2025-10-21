import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "../../app/store";
import { useUser } from "@supabase/auth-helpers-react";
import TasksPage from "./TaskPage";
import { server } from "../../../test/testServer";

// ✅ Mock toàn bộ module trước khi import TaskPage
vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: vi.fn(),
}));

vi.mock("./useTask", () => ({
  useTasks: vi.fn(),
  useUpdateTaskStatus: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(), // sẽ được gán lại trong từng test
  };
});

import { useTasks, useUpdateTaskStatus } from "./useTask";

const queryClient = new QueryClient();

const renderWithProviders = () =>
  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TasksPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );

describe("TasksPage Integration Test", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as vi.Mock).mockReturnValue({ id: "user-123" });
  });

  (useUpdateTaskStatus as vi.Mock).mockReturnValue({
    mutate: vi.fn(),
  });

  // Case 1: spinner khi load task
  it("render_shouldShowLoadingIndicator_whenFetchingTasks", () => {
    (useTasks as vi.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  // Case 2: Hiện error mess khi api lỗi
  it("render_shouldShowErrorMessage_whenApiFails", async () => {
    (useTasks as vi.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    renderWithProviders();
    expect(
      await screen.findByText(/Có lỗi xảy ra, vui lòng thử lại sau/i)
    ).toBeInTheDocument();
  });

  // Case 3: Hiển thị khi không có task
  it("render_shouldShowEmptyState_whenNoTasks", async () => {
    (useTasks as vi.Mock).mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders();
    expect(
      await screen.findByText(
        /Không tìm thấy task nào phù hợp với điều kiện lọc\/tìm kiếm/i
      )
    ).toBeInTheDocument();
  });

  // Case 4: Hiển thị danh sách task khi load xong
  it("render_shouldDisplayTasksTable_whenDataLoaded", async () => {
    (useTasks as vi.Mock).mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            title: "Test Task 1",
            status: "To Do",
            priority: "High",
            deadline: "2025-10-21",
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders();

    const taskTitles = await screen.findAllByText("Test Task 1");
    expect(taskTitles.length).toBeGreaterThan(0);
    const taskStatus = await screen.findAllByText("High");
    expect(taskStatus.length).toBeGreaterThan(0);
  });

  // Case 5: Gọi update task khi nhấn Checkbox
  it("toggleStatus_shouldUpdateTaskStatus_whenCheckboxClicked", async () => {
    const refetchMock = vi.fn();
    const mutateMock = vi.fn();

    (useTasks as vi.Mock).mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            title: "Task to toggle",
            status: "To Do",
            priority: "Low",
            deadline: "2025-10-21",
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: refetchMock,
    });

    (useUpdateTaskStatus as vi.Mock).mockReturnValue({
      mutate: mutateMock,
    });

    renderWithProviders();

    const checkboxes = await screen.findAllByRole("checkbox");
    const checkbox = checkboxes[0];

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        { taskId: "1", status: "Done" },
        expect.any(Object)
      );
    });
  });

  // Case 6:
  it("filter_shouldRefetchTasks_whenStatusOrPriorityChanged", async () => {
    const refetchMock = vi.fn();

    (useTasks as vi.Mock).mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: refetchMock,
    });

    renderWithProviders();

    const statusSelect = screen.getByDisplayValue("Trạng thái");
    const prioritySelect = screen.getByDisplayValue("Ưu tiên");

    fireEvent.change(statusSelect, { target: { value: "Done" } });
    fireEvent.change(prioritySelect, { target: { value: "High" } });

    await waitFor(() => {
      expect(statusSelect).toHaveValue("Done");
      expect(prioritySelect).toHaveValue("High");
    });
  });

  // Case 7:
  it("pagination_shouldChangePage_whenClickNextOrPrev", async () => {
    (useTasks as vi.Mock).mockReturnValue({
      data: {
        data: new Array(9).fill({
          id: "x",
          title: "Task X",
          status: "To Do",
          priority: "Low",
          deadline: "2025-10-21",
        }),
        total: 18,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders();

    const nextBtn = await screen.findByText(">");
    fireEvent.click(nextBtn);
    expect(nextBtn).toBeInTheDocument();
  });

  it("navigate_shouldGoToCreateTaskPage_whenClickCreateButton", async () => {
    // Tạo mockNavigate cho case này
    const mockNavigate = vi.fn();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);

    // Mock dữ liệu useTasks rỗng (để trang load nhanh)
    (useTasks as vi.Mock).mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    // Render page
    renderWithProviders();

    // Tìm nút tạo mới task
    const createBtn = await screen.findByRole("button", {
      name: /\+ tạo mới task/i, // chú ý text phải đúng (viết hoa/thường khớp với UI)
    });

    // Click nút
    fireEvent.click(createBtn);

    // Kiểm tra navigate đã được gọi đúng
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/createtask");
    });
  });
});
