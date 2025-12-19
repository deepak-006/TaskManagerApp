import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../model/task';
import { TaskService } from '../../service/task/task.service';
import { UserService } from '../../service/user/user.service';

@Component({
  selector: 'app-deleted-tasks',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.css']
})
export class DeletedComponent implements OnInit {

  deletedTasks: Task[] = [];
  message = '';

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = this.userService.getToken();
    if (!token) {
      this.router.navigate(['']);
      return;
    }

    this.loadDeletedTasks();
  }

  loadDeletedTasks(): void {
    this.taskService.getDeletedTasks().subscribe({
      next: (data: Task[]) => {
        this.deletedTasks = data;
      },
      error: () => {
        this.message = 'Failed to load deleted tasks.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
