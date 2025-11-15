import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../service/user/user.service';
import { AdminService } from '../../service/admin/admin.service';
import { User } from '../../model/user';
import { Task } from '../../model/task';

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

interface ActivityLog {
  message: string;
  timestamp: Date;
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
  logs: ActivityLog[] = [];
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  activeView: DashboardView = 'users';
  isLoading: boolean = false;
  userName: string | null = '';

  // ⭐ ONLY THREE CARDS NOW
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
      this.router.navigate(['/login']);
      return;
    }

    this.userName = this.userService.getUserName();
    this.loadUsersAndTasks();
    this.loadLogs();
  }

  // Load all users first
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
      error: (err) => {
        console.error(err);
        this.message = 'Error loading users.';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  // Load tasks and attach user names
  loadTasksWithMapping(): void {
    this.adminService.getAllTasks().subscribe({
      next: (taskRes: Task[]) => {

        this.tasks = taskRes.map(task => {
          const assignedUser = this.users.find(u => u.id === task.assignedTo);
          return {
            ...task,
            assignedToName: assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : 'Unassigned'
          };
        });

        this.summaryCards[1].value = this.tasks.length;

        this.filteredTasks = [...this.tasks]; // always all tasks
        this.showView('users');
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.message = 'Error loading tasks.';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  // Assign Task Model
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

  // Assign Task Method
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
      error: (err) => {
        console.error(err);
        this.message = 'Failed to assign task.';
        this.messageType = 'error';
      }
    });
  }

  // View switching
  showView(view: DashboardView): void {
    this.activeView = view;

    if (view === 'allTasks') {
      this.filteredTasks = [...this.tasks]; // always full list
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
      error: (err) => {
        console.error(err);
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
      error: (err) => {
        console.error(err);
        this.message = 'Failed to update user role.';
        this.messageType = 'error';
      }
    });
  }

  loadLogs(): void {
    this.logs = [
      { message: 'Rohan created a new task.', timestamp: new Date() },
      { message: 'Neha updated a task.', timestamp: new Date() },
      { message: 'Amit deleted a task.', timestamp: new Date() },
      { message: 'Rohan changed Neha’s role to Admin.', timestamp: new Date() }
    ];
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
