import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Task } from '../../model/task';
import { TaskService } from '../../service/task/task.service';
import { UserService } from '../../service/user/user.service'; 
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  tasks: Task[] = [];
  message: string = '';
  userName: string | null = '';

  newTask: Task = this.getEmptyTask();

  @ViewChild('addTaskModal') addTaskModal!: ElementRef;
  private modalInstance!: bootstrap.Modal;

  @ViewChild('editTaskModal') editTaskModal!: ElementRef;
  private editModalInstance!: bootstrap.Modal;
  editTaskData: Task = this.getEmptyTask();

  constructor(private taskService: TaskService, private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loadTasks();
    const token = this.userService.getToken();
    this.userName = this.userService.getUserName();
    if (!token) {
      this.router.navigate(['/login']);
    }
  }


  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.addTaskModal.nativeElement);
    this.editModalInstance = new bootstrap.Modal(this.editTaskModal.nativeElement);
  }

  openAddTaskModal(): void {
    this.modalInstance.show();
  }

  closeAddTaskModal(): void {
    this.modalInstance.hide();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data: Task[]) => {
        this.tasks = data;
        this.message = '';
      },
      error: (err) => {
        console.error(err);
        this.message = 'Failed to load tasks.';
      }
    });
  }

  addTask(): void {
    this.taskService.addTask(this.newTask).subscribe({
      next: (res: Task) => {
        this.tasks.push(res);
        this.newTask = this.getEmptyTask();

        // Hide the modal
        this.modalInstance.hide();

        this.message = 'Task added successfully!';
      },
      error: (err) => {
        console.error(err);
        this.message = 'Failed to add task.';
      }
    });
  }

  private getEmptyTask(): Task {
    return {
      taskId: 0,
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  editTask(task: Task): void {
    this.editTaskData = { ...task }; // clone to avoid changing the list directly
    // Fix due date formatting (works already)
    this.editTaskData.dueDate = task.dueDate.split('T')[0];

    // Fix priority (high → High)
    this.editTaskData.priority =
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase();

    // Fix status (pending → Pending, in_progress → In Progress)
    this.editTaskData.status = task.status
      .replace('_', ' ')
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    this.editModalInstance.show();
  }

  closeEditTaskModal(): void {
    this.editModalInstance.hide();
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: (res: { success: boolean; message: string }) => {
          if (res.success) {
            this.tasks = this.tasks.filter(task => task.taskId !== id);
          }
          this.message = res.message;
        },
        error: (err) => {
          console.error(err);
          this.message = 'Failed to delete task.';
        }
      });
    }
  }

  updateTask(): void {
    this.taskService.updateTask(this.editTaskData).subscribe({
      next: (updatedTask: Task) => {
        // Update local tasks array
        const index = this.tasks.findIndex(t => t.taskId === updatedTask.taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }

        this.editModalInstance.hide();
        this.message = 'Task updated successfully!';
      },
      error: (err) => {
        console.error(err);
        this.message = 'Failed to update task.';
      }
    });
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
