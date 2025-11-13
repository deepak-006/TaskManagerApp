import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../service/user/user.service';
import { AdminService } from '../../service/admin/admin.service';
import { User } from '../../model/user';
import { Task } from '../../model/task';

type DashboardView = 'users' | 'allTasks' | 'completedTasks' | 'pendingTasks';

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


  summaryCards: SummaryCard[] = [
    { title: 'Total Users', icon: 'bi bi-people-fill', type: 'users', value: 0 },
    { title: 'Total Tasks', icon: 'bi bi-list-check', type: 'allTasks', value: 0 },
    { title: 'Completed Tasks', icon: 'bi bi-check-circle', type: 'completedTasks', value: 0 },
    { title: 'Pending Tasks', icon: 'bi bi-hourglass-split', type: 'pendingTasks', value: 0 }
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
    // Load both users and tasks together
    this.loadUsersAndTasks();
    this.loadLogs();
  }

  // ✅ Load users first, then tasks — so we can map user names
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

        // Once users are loaded, load tasks
        this.loadTasksWithMapping();
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.message = 'Error loading users.';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  // ✅ Load tasks and map assigned user names
  loadTasksWithMapping(): void {
    this.adminService.getAllTasks().subscribe({
      next: (taskRes: Task[]) => {
        // Map tasks to include assigned user name
        this.tasks = taskRes.map(task => {
          const assignedUser = this.users.find(u => u.id === task.assignedTo);
          return {
            ...task,
            assignedToName: assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : 'Unassigned'
          };
        });

        this.updateSummaryCounts();
        this.showView('users'); // default view
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        this.message = 'Error loading tasks.';
        this.messageType = 'error';
        this.isLoading = false;
      }
    });
  }

  updateSummaryCounts(): void {
    this.summaryCards[1].value = this.tasks.length;
    this.summaryCards[2].value = this.tasks.filter(t => t.status === 'Completed').length;
    this.summaryCards[3].value = this.tasks.filter(t => t.status === 'Pending').length;
  }

  // ✅ Switch between views
  showView(view: DashboardView): void {
    this.activeView = view;
    if (view === 'completedTasks') {
      this.filteredTasks = this.tasks.filter(t => t.status === 'Completed');
    } else if (view === 'pendingTasks') {
      this.filteredTasks = this.tasks.filter(t => t.status === 'Pending');
    } else if (view === 'allTasks') {
      this.filteredTasks = [...this.tasks];
    }
  }

  // ✅ Refresh users manually
  refreshUsers(): void {
    this.loadUsersAndTasks();
    this.message = 'User list refreshed!';
    this.messageType = 'success';
  }

  // ✅ Delete user
  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: (res) => {
          this.users = this.users.filter(u => u.id !== userId);
          this.summaryCards[0].value = this.users.length;
          this.message = res?.message || 'User deleted successfully.';
          this.messageType = 'success';
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.message = 'Error deleting user.';
          this.messageType = 'error';
        }
      });
    }
  }

  // ✅ Change role
  changeRole(user: AdminUser): void {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    if (confirm(`Change ${user.firstName}'s role to ${newRole}?`)) {
      this.adminService.updateUserRole(user.id, newRole).subscribe({
        next: () => {
          user.role = newRole;
          this.message = `${user.firstName}'s role changed to ${newRole}.`;
          this.messageType = 'success';
        },
        error: (err) => {
          console.error('Error updating role:', err);
          this.message = 'Failed to update user role.';
          this.messageType = 'error';
        }
      });
    }
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
