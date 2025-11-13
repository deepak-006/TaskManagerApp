import { Task } from "./task";

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;     // ISO string from API (e.g., "2025-11-07")
  email: string;
  role: string;            // "Admin" | "User"
  lastLogin: string | null;
  isDeleted: boolean;
  createdAt: string;       // ISO timestamp (e.g., "2025-11-07T14:11:26.837")
  updatedAt: string;       // ISO timestamp
  tasks: Task[];           // reference to user's tasks
}
