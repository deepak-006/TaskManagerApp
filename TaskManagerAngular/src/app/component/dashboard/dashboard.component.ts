import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';

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
  filteredTasks: Task[] = [];
  message: string = '';
  searchText: string = '';

  newTask: Task = this.getEmptyTask();
  editTaskData: Task = this.getEmptyTask();

  @ViewChild('addTaskModal') addTaskModal!: ElementRef;
  @ViewChild('editTaskModal') editTaskModal!: ElementRef;

  private modalInstance!: bootstrap.Modal;
  private editModalInstance!: bootstrap.Modal;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTasks();

    // If user not logged in redirect
    if (!this.userService.getToken()) {
      this.router.navigate(['']);
    }
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.addTaskModal.nativeElement);
    this.editModalInstance = new bootstrap.Modal(this.editTaskModal.nativeElement);
  }

  /* ------------------ LOAD TASKS ------------------ */
  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.filteredTasks = data;
      },
      error: () => this.message = 'Failed to load tasks.'
    });
  }

  /* ------------------ SEARCH ------------------ */
  filterTasks(): void {
    const text = this.searchText.toLowerCase();

    this.filteredTasks = this.tasks.filter(task =>
      task.title.toLowerCase().includes(text) ||
      task.description.toLowerCase().includes(text) ||
      task.status.toLowerCase().includes(text) ||
      task.priority.toLowerCase().includes(text)
    );
  }

  clearSearch() {
    this.searchText = '';
    this.filteredTasks = this.tasks;
  }


  /* ------------------ NAVIGATION ------------------ */
  goToBoard() { this.router.navigate(['/board']); }
  goToAnalytics() { this.router.navigate(['/analytics']); }
  goToCalendar() { this.router.navigate(['/calendar']); }
  goToRecycleBin() { this.router.navigate(['/recycle-bin']); }


  /* ------------------ TASK MODALS ------------------ */
  openAddTaskModal() { this.modalInstance.show(); }
  closeAddTaskModal() { this.modalInstance.hide(); }

  openEditModal(task: Task) {
    this.editTaskData = { ...task };
    this.editTaskData.dueDate = task.dueDate.split('T')[0];
    this.editModalInstance.show();
  }

  closeEditTaskModal() { this.editModalInstance.hide(); }

  /* ------------------ CRUD OPS ------------------ */
  addTask() {
    this.taskService.addTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.filteredTasks = this.tasks;
        this.newTask = this.getEmptyTask();
        this.modalInstance.hide();
        this.message = 'Task added successfully!';
      }
    });
  }

  deleteTask(id: number) {
    if (!confirm("Delete this task?")) return;

    this.taskService.deleteTask(id).subscribe({
      next: (res) => {
        if (res.success)
          this.tasks = this.tasks.filter(t => t.taskId !== id);

        this.filteredTasks = this.tasks;
        this.message = res.message;
      }
    });
  }

  updateTask() {
    this.taskService.updateTask(this.editTaskData).subscribe({
      next: (updated) => {
        const i = this.tasks.findIndex(t => t.taskId === updated.taskId);
        if (i !== -1) this.tasks[i] = updated;

        this.filteredTasks = this.tasks;
        this.editModalInstance.hide();
        this.message = "Task updated!";
      }
    });
  }

  /* ------------------ UTIL ------------------ */
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
}
