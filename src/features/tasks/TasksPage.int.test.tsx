// TasksPage.int.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/* -------------------------
   Mocks (giữ tương tự bạn đã dùng)
   ------------------------- */
vi.mock("../../layout/DashboardLayout", () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => (to: string) => {
      window.history.pushState({}, "", to);
    },
  };
});

vi.mock("@supabase/auth-helpers-react", () => ({
  useUser: vi.fn(),
}));

vi.mock("./useTask", () => ({
  useTasks: vi.fn(),
  useUpdateTaskStatus: vi.fn(),
}));

/* -------------------------
   Imports AFTER mocks
   ------------------------- */
import TasksPage from "./TaskPage";
import { useTasks, useUpdateTaskStatus } from "./useTask";
import { useUser } from "@supabase/auth-helpers-react";

const useTasksMock = useTasks as unknown as vi.Mock;
const useUpdateTaskStatusMock = useUpdateTaskStatus as unknown as vi.Mock;
const useUserMock = useUser as unknown as vi.Mock;

/* helper: tạo QueryClient mới mỗi lần để tránh cache giữa test */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

/* helper render (mỗi lần render dùng 1 client mới) */
function renderPage() {
  const client = createQueryClient();
  return render(
    <MemoryRouter initialEntries={["/tasks"]}>
      <QueryClientProvider client={client}>
        <TasksPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

/* Mock data */
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

beforeEach(() => {
  vi.clearAllMocks();
  // set default user
  useUserMock.mockReturnValue({ id: "user_1", email: "a@b.com" });
  // default update hook
  useUpdateTaskStatusMock.mockReturnValue({ mutate: vi.fn() });
});

afterEach(() => {
  document.body.innerHTML = "";
});

it("hiển thị loading spinner khi isLoading = true", () => {
  useTasksMock.mockReturnValue({
    data: undefined, // <-- để undefined, tránh bị xử lý như "không có task"
    isLoading: true,
    isError: false,
    refetch: vi.fn(),
  });

  renderPage();

  expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
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

it("render danh sách task khi có data (desktop + mobile)", async () => {
  useTasksMock.mockReturnValue({
    data: { data: mockTasks, total: mockTasks.length },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });

  renderPage();

  // đợi ít nhất 1 element mobile (heading) xuất hiện
  await screen.findByRole("heading", { name: "Task A" });

  expect(screen.getByRole("cell", { name: "Task A" })).toBeInTheDocument();

  const prioritySpans = screen
    .getAllByText("High")
    .filter((el) => el.tagName === "SPAN");
  expect(prioritySpans.length).toBeGreaterThanOrEqual(1);

  const deadlines = screen
    .getAllByText("10/09/2025")
    .filter((el) => el.tagName !== "OPTION");
  expect(deadlines.length).toBeGreaterThanOrEqual(1);

  expect(screen.getByRole("heading", { name: "Task A" })).toBeInTheDocument();
});

it("checkbox toggle gọi updateTaskStatus với payload đúng", async () => {
  const mutateMock = vi.fn();
  useUpdateTaskStatusMock.mockReturnValue({ mutate: mutateMock });

  useTasksMock.mockReturnValue({
    data: { data: mockTasks, total: mockTasks.length },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });

  renderPage();

  // có thể có 2 checkbox per task (desktop + mobile) -> lấy all, click cái đầu
  const checkboxes = await screen.findAllByRole("checkbox");
  expect(checkboxes.length).toBeGreaterThan(0);

  fireEvent.click(checkboxes[0]);

  expect(mutateMock).toHaveBeenCalledWith(
    { taskId: "1", status: "Done" },
    expect.any(Object)
  );
});

it("phân trang hiển thị đúng số trang (LIMIT = 9)", async () => {
  useTasksMock.mockReturnValue({
    data: { data: mockTasks, total: 20 }, // total = 20 -> pages = 3
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });

  renderPage();

  // Chờ DOM có bảng (dùng role cụ thể để tránh ambiguous)
  await screen.findByRole("cell", { name: "Task A" });

  // Lấy tất cả element có text là số (chỉ lấy các nút / text số trên pagination)
  const pageNumberEls = screen.getAllByText(/^[0-9]+$/);

  // Tách text và trim
  const pageNumbers = pageNumberEls.map((el) => (el.textContent || "").trim());

  // Kiểm tra tồn tại các trang "1","2","3" và chỉ có 3 nút số
  expect(pageNumbers).toContain("1");
  expect(pageNumbers).toContain("2");
  expect(pageNumbers).toContain("3");
  expect(pageNumbers.length).toBe(3);
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

  expect(window.location.pathname).toBe("/createtask");
});
