export type Priority = "Low" | "Medium" | "High";
export type Status = "To Do" | "In Progress" | "Done";

export interface ChecklistItem {
  id: string;
  content: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  created_at: string;
  updatedAt: string;
  completed: boolean;
  priority: Priority;
  status: Status;
  checklist?: ChecklistItem[];
}

// Form create task
export interface TaskInput {
  title: string;
  description?: string;
  deadline: string;
  priority: Priority;
  status: Status;
  checklist?: ChecklistItem[];
  user_id: string;
  created_at: string;
}

export interface TaskFilter {
  status: "all" | Status;
  priority?: Priority;
}
