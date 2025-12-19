import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../service/task/task.service';
import { Task } from '../../model/task';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {

  tasks: Task[] = [];
  pending: Task[] = [];
  inprogress: Task[] = [];
  completed: Task[] = [];

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res;
      this.splitTasks();
    });
  }

  splitTasks() {
    this.pending = this.tasks.filter(t => t.status === 'Pending');
    this.inprogress = this.tasks.filter(t => t.status === 'In Progress');
    this.completed = this.tasks.filter(t => t.status === 'Completed');
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data,
        event.previousIndex,
        event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedTask = event.container.data[event.currentIndex];

      let newStatus = '';
      if (event.container.id === 'pending') newStatus = 'Pending';
      if (event.container.id === 'inprogress') newStatus = 'In Progress';
      if (event.container.id === 'completed') newStatus = 'Completed';

      movedTask.status = newStatus;

      this.taskService.updateTask(movedTask).subscribe();
    }
  }

  editTask(task: Task) {
    // You will connect this later to your existing modals
    console.log("Edit task:", task);
  }

  deleteTask(taskId: number) {
    // This will call your existing delete flow
    console.log("Delete task:", taskId);
  }
}
