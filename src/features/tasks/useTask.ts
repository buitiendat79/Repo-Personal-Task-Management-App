import { useMutation, useQuery } from "@tanstack/react-query";
import { createTask, fetchTasks } from "../../api/taskApi";
import { TaskInput } from "../../types/task";
import { fetchTaskById, updateTask, deleteTask } from "../../api/taskApi";

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (task: TaskInput) => createTask(task),
  });
};

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
    keepPreviousData: true, // không flick khi chuyển trang
  });
};

// Fetch 1 task theo id
export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: !!taskId,
  });
};

// Update task
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

// Delete task
export const useDeleteTask = () => {
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
  });
};
