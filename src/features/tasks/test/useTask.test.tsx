// src/hooks/useTask.test.tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

vi.mock("../../../api/taskApi", () => ({
  createTask: vi.fn(),
  fetchTasks: vi.fn(),
  fetchTaskById: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateCompleted: vi.fn(),
  updateTaskStatus: vi.fn(),
  fetchTaskStats: vi.fn(),
}));

import {
  createTask,
  fetchTasks,
  fetchTaskById,
  updateTask,
  deleteTask,
  updateCompleted,
  updateTaskStatus,
  fetchTaskStats,
} from "../../../api/taskApi";

import {
  useCreateTask,
  useTasks,
  useTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskCompleted,
  useUpdateTaskStatus,
  useTaskStats,
} from "../useTask";

// create a QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // speed up tests
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTask hooks", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call createTask API when using useCreateTask", async () => {
    const mockData = { id: "1", title: "New task" };
    // TS: cast to vi.Mock to use mockResolvedValueOnce
    (createTask as unknown as vi.Mock).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      await result.current.mutateAsync({ title: "New task" });
    });

    expect(createTask).toHaveBeenCalledWith({ title: "New task" });
  });

  it("should fetch tasks for a user", async () => {
    const mockData = [{ id: "1", title: "Task A" }];
    (fetchTasks as unknown as vi.Mock).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () =>
        useTasks("user-123", undefined, undefined, undefined, undefined, 1, 5),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchTasks).toHaveBeenCalledWith(
      "user-123",
      undefined,
      undefined,
      undefined,
      undefined,
      1,
      5
    );
    expect(result.current.data).toEqual(mockData);
  });

  it("should fetch task by id", async () => {
    const mockTask = { id: "123", title: "Sample Task" };
    (fetchTaskById as unknown as vi.Mock).mockResolvedValueOnce(mockTask);

    const { result } = renderHook(() => useTask("123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchTaskById).toHaveBeenCalledWith("123");
    expect(result.current.data).toEqual(mockTask);
  });

  it("should call updateTask API with correct args", async () => {
    const mockResponse = { id: "1", title: "Updated" };
    (updateTask as unknown as vi.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateTask(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      await result.current.mutateAsync({
        taskId: "1",
        updates: { title: "Updated" },
      });
    });

    expect(updateTask).toHaveBeenCalledWith("1", { title: "Updated" });
  });

  it("should call deleteTask API with task id", async () => {
    (deleteTask as unknown as vi.Mock).mockResolvedValueOnce(true);

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      await result.current.mutateAsync("1");
    });

    expect(deleteTask).toHaveBeenCalledWith("1");
  });

  it("should call updateCompleted and updateTaskStatus correctly when toggling completed", async () => {
    (updateCompleted as unknown as vi.Mock).mockResolvedValueOnce({});
    (updateTaskStatus as unknown as vi.Mock).mockResolvedValueOnce({});

    const { result } = renderHook(() => useToggleTaskCompleted(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      await result.current.mutateAsync({ taskId: "1", completed: true });
    });

    expect(updateCompleted).toHaveBeenCalledWith("1", true);
    expect(updateTaskStatus).toHaveBeenCalledWith("1", "Done");
  });

  it("should call updateTaskStatus API", async () => {
    (updateTaskStatus as unknown as vi.Mock).mockResolvedValueOnce({
      id: "1",
      status: "Done",
    });

    const { result } = renderHook(() => useUpdateTaskStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      await result.current.mutateAsync({ taskId: "1", status: "Done" });
    });

    expect(updateTaskStatus).toHaveBeenCalledWith("1", "Done");
  });

  it("should fetch task stats for user", async () => {
    const mockStats = { total: 10, completed: 5 };
    (fetchTaskStats as unknown as vi.Mock).mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useTaskStats("user-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchTaskStats).toHaveBeenCalledWith("user-123");
    expect(result.current.data).toEqual(mockStats);
  });
});
