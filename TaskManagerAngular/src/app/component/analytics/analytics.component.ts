import { Component, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { TaskService } from '../../service/task/task.service';
import { Task } from '../../model/task';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  tasks: Task[] = [];
  upcoming: any[] = [];
  overdue: any[] = []; // ⭐ NEW

  barChartData: ChartData<'bar'> = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Task Count',
        backgroundColor: ['#FFA726', '#29B6F6', '#66BB6A']
      }
    ]
  };

  doughnutData: ChartData<'doughnut'> = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#42A5F5', '#FFCA28', '#EF5350']
      }
    ]
  };

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res || [];

      this.updateStatusChart();
      this.updatePriorityChart();
      this.calculateUpcomingDeadlines();
      this.calculateOverdueTasks(); // ⭐ Added
    });
  }

  normalize(v: string | null | undefined): string {
    return v?.trim().toLowerCase() ?? '';
  }

  updateStatusChart() {
    const pending = this.tasks.filter(t => this.normalize(t.status) === 'pending').length;
    const inprogress = this.tasks.filter(t => this.normalize(t.status) === 'in progress').length;
    const completed = this.tasks.filter(t => this.normalize(t.status) === 'completed').length;

    this.barChartData = {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [
        {
          data: [pending, inprogress, completed],
          label: 'Task Count',
          backgroundColor: ['#FFA726', '#29B6F6', '#66BB6A']
        }
      ]
    };
  }

  updatePriorityChart() {
    const low = this.tasks.filter(t => this.normalize(t.priority) === 'low').length;
    const medium = this.tasks.filter(t => this.normalize(t.priority) === 'medium').length;
    const high = this.tasks.filter(t => this.normalize(t.priority) === 'high').length;

    this.doughnutData = {
      labels: ['Low', 'Medium', 'High'],
      datasets: [
        {
          data: [low, medium, high],
          backgroundColor: ['#42A5F5', '#FFCA28', '#EF5350']
        }
      ]
    };
  }

  /* ⭐ NEW — UPCOMING DEADLINES */
/* ⭐ UPDATED — UPCOMING DEADLINES (limit 5) */
calculateUpcomingDeadlines() {
  const today = new Date();

  this.upcoming = this.tasks
    .filter(t => t.dueDate && new Date(t.dueDate) > today)
    .map(t => ({
      ...t,
      remainingDays: Math.ceil(
        (new Date(t.dueDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
      )
    }))
    .sort((a, b) => a.remainingDays - b.remainingDays)
    .slice(0, 5);   // ⭐ LIMIT to first 5 tasks
}


  /* ⭐ NEW — OVERDUE TASKS */
  calculateOverdueTasks() {
    const today = new Date();

    this.overdue = this.tasks
      .filter(t => t.dueDate && new Date(t.dueDate) < today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }
}
