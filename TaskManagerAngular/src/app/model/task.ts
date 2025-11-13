export interface Task {
  taskId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
  assignedTo?: number;
  updatedAt: string;
}
