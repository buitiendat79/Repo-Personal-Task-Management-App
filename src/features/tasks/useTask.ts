import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  fetchTasks,
  fetchTaskById,
  updateTask,
  deleteTask,
  updateCompleted,
  updateTaskStatus,
  fetchTaskStats,
} from "../../api/taskApi";
import { TaskInput } from "../../types/task";

// Create
export const useCreateTask = () => {
  return useMutation({
    mutationFn: (task: TaskInput) => createTask(task),
  });
};

// Fetch task
export const useTasks = (
  userId: string,
  status?: string,
  priority?: string,
  deadline?: string,
  search?: string,
  page = 1,
  limit = 5
) => {
  return useQuery({
    queryKey: ["tasks", userId, status, priority, deadline, search, page],
    queryFn: () =>
      fetchTasks(userId, status, priority, deadline, search, page, limit),
    enabled: !!userId,
    keepPreviousData: true,
  });
};

// Hook lấy 1 task theo id
export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: !!taskId,
  });
};

// Hook cập nhật task theo id
export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<TaskInput>;
    }) => updateTask(taskId, updates),
  });
};

// Hook xoá task theo id
export const useDeleteTask = () => {
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
  });
};

export const useToggleTaskCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) => {
      await updateCompleted(taskId, completed);
      const newStatus = completed ? "Done" : "To Do";
      await updateTaskStatus(taskId, newStatus);
    },
    onSuccess: (_, variables) => {
      // Refetch danh sách task sau khi cập nhật
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },
  });
};

export const useUpdateTaskStatus = () => {
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      updateTaskStatus(taskId, status),
  });
};

export const useTaskStats = (userId: string) => {
  return useQuery({
    queryKey: ["taskStats", userId],
    queryFn: () => fetchTaskStats(userId),
    enabled: !!userId,
  });
};
