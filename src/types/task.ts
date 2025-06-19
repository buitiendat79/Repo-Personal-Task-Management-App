export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  status: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}