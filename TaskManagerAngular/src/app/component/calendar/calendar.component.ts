import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../service/task/task.service';
import { Task } from '../../model/task';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  tasks: Task[] = [];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: any[] = [];

  currentMonth!: number;
  currentYear!: number;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();

    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(res => {
      this.tasks = res || [];
      this.generateCalendar();
    });
  }

  generateCalendar() {
    const year = this.currentYear;
    const month = this.currentMonth;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: any[] = [];

    // Add transparent placeholders BEFORE day 1
    for (let i = 0; i < firstDay; i++) {
      cells.push({ empty: true });
    }

    // Actual days with tasks
    for (let day = 1; day <= daysInMonth; day++) {

      const tasksForDay = this.tasks.filter(t => {
        if (!t.dueDate) return false;

        const due = new Date(t.dueDate);

        return (
          due.getDate() === day &&
          due.getMonth() === month &&
          due.getFullYear() === year
        );
      });

      cells.push({
        empty: false,
        day: day,
        tasks: tasksForDay
      });
    }

    this.calendarDays = cells;
  }

  goToPrevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  goToNextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  get monthName() {
    return new Date(this.currentYear, this.currentMonth)
      .toLocaleString('default', { month: 'long' });
  }
}
