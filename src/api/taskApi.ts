import { supabase } from "./supabaseClient";
import { Task, TaskInput } from "../types/task";

// Tạo task mới
export const createTask = async (task: TaskInput) => {
  const { data, error } = await supabase.from("tasks").insert(task).select();
  if (error) throw error;
  return data;
};

// Lấy danh sách task theo filter
export const fetchTasks = async (
  userId: string,
  status?: string,
  priority?: string,
  deadline?: string,
  search?: string,
  page = 1,
  limit = 5
): Promise<{ data: Task[]; total: number }> => {
  let query = supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (priority && priority !== "all") {
    query = query.eq("priority", priority);
  }

  if (deadline) {
    query = query.eq("deadline", deadline);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
  };
};

// task theo id
export const fetchTaskById = async (taskId: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) throw error;
  return data;
};

// Cập nhật 1 task theo id
export const updateTask = async (
  taskId: string,
  updates: Partial<TaskInput>
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Xoá task theo id
export const deleteTask = async (taskId: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
};

// Cập nhật trạng thái
export const updateCompleted = async (taskId: string, completed: boolean) => {
  const { error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }
};
