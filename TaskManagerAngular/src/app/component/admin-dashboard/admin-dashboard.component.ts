import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../service/user/user.service';
import { AdminService } from '../../service/admin/admin.service';
import { User } from '../../model/user';
import { Task } from '../../model/task';
import { LogEntry } from '../../model/log';

type DashboardView = 'users' | 'allTasks' | 'assigntask';

interface SummaryCard {
  title: string;
  icon: string;
  type: DashboardView;
  value?: number;
}

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface MappedTask extends Task {
  assignedToName?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  users: AdminUser[] = [];
  tasks: MappedTask[] = [];
  filteredTasks: MappedTask[] = [];
  logs: LogEntry[] = [];

  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  activeView: DashboardView = 'users';
  isLoading: boolean = false;
  userName: string | null = '';

  // Pagination
  pageNumber: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;

  // Filters
  selectedStatus: string = '';
  selectedPriority: string = '';
  selectedUser: string = '';

  summaryCards: SummaryCard[] = [
    { title: 'Total Users', icon: 'bi bi-people-fill', type: 'users', value: 0 },
    { title: 'Total Tasks', icon: 'bi bi-list-check', type: 'allTasks', value: 0 },
    { title: 'Assign Task', icon: 'bi bi-plus-circle', type: 'assigntask', value: 0 }
  ];

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = this.userService.getToken();
    if (!token) {
      this.router.navigate(['']);
      return;
    }

    this.userName = this.userService.getUserName();
    this.loadUsersAndTasks();
    this.loadLogs();
  }

  loadUsersAndTasks(): void {
    this.isLoading = true;

    this.adminService.getAllUsers().subscribe({
      next: (userRes: User[]) => {
        this.users = userRes.map(u => ({
          id: u.userId,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role
        }));

        this.summaryCards[0].value = this.users.length;
        this.loadTasksWithMapping();
      },
      error: () => {
        this.message = 'Error loading users.';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  loadTasksWithMapping(): void {
    this.adminService.getAllTasks(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        const taskRes = response.body || [];

        this.totalCount = Number(response.headers.get("X-Total-Count")) || 0;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);

        this.tasks = taskRes.map(task => {
          const assignedUser = this.users.find(u => u.id === task.assignedTo);
          return {
            ...task,
            assignedToName: assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : 'Unassigned'
          };
        });

        this.summaryCards[1].value = this.totalCount;

        this.applyFilters();  // APPLY FILTERS AFTER FETCH

        this.isLoading = false;
      },
      error: () => {
        this.message = 'Error loading tasks.';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  // APPLY FILTERS
  applyFilters(): void {
    let result = [...this.tasks];

    if (this.selectedStatus) {
      result = result.filter(t => t.status === this.selectedStatus);
    }

    if (this.selectedPriority) {
      result = result.filter(t => t.priority === this.selectedPriority);
    }

    if (this.selectedUser) {
      result = result.filter(t => t.assignedToName === this.selectedUser);
    }

    this.filteredTasks = result;
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadTasksWithMapping();
    }
  }

  previousPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadTasksWithMapping();
    }
  }

  newTask: Task = {
    taskId: 0,
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '',
    assignedTo: 0,
    createdAt: '',
    updatedAt: ''
  };

  assignTask(): void {
    this.newTask.createdAt = new Date().toISOString();
    this.newTask.updatedAt = new Date().toISOString();

    this.adminService.assignTaskToUser(this.newTask).subscribe({
      next: () => {
        this.message = 'Task assigned successfully!';
        this.messageType = 'success';
        this.loadUsersAndTasks();
        this.activeView = 'allTasks';

        this.newTask = {
          taskId: 0,
          title: '',
          description: '',
          status: 'Pending',
          priority: 'Medium',
          dueDate: '',
          assignedTo: 0,
          createdAt: '',
          updatedAt: ''
        };
      },
      error: () => {
        this.message = 'Failed to assign task.';
        this.messageType = 'error';
      }
    });
  }

  showView(view: DashboardView): void {
    this.activeView = view;

    if (view === 'allTasks') {
      this.applyFilters();
    }
  }

  refreshUsers(): void {
    this.loadUsersAndTasks();
    this.message = 'User list refreshed!';
    this.messageType = 'success';
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.adminService.deleteUser(userId).subscribe({
      next: (res) => {
        this.users = this.users.filter(u => u.id !== userId);
        this.summaryCards[0].value = this.users.length;

        this.message = res?.message || 'User deleted successfully.';
        this.messageType = 'success';
      },
      error: () => {
        this.message = 'Error deleting user.';
        this.messageType = 'error';
      }
    });
  }

  changeRole(user: AdminUser): void {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';

    if (!confirm(`Change ${user.firstName}'s role to ${newRole}?`)) return;

    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.message = `${user.firstName}'s role changed to ${newRole}.`;
        this.messageType = 'success';
      },
      error: () => {
        this.message = 'Failed to update user role.';
        this.messageType = 'error';
      }
    });
  }

  loadLogs(): void {
    this.adminService.getAllLogs().subscribe({
      next: (logRes: LogEntry[]) => {
        this.logs = logRes;
      },
      error: () => {
        this.message = 'Error loading logs.';
        this.messageType = 'error';
      }
    });
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
