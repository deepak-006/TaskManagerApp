import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../model/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('https://localhost:7165/api/Task/GetTasks');
  }

  deleteTask(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `https://localhost:7165/api/Task/DeleteTask?taskId=${id}`
    );
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>('https://localhost:7165/api/Task/CreateTask', task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.patch<Task>('https://localhost:7165/api/Task/UpdateTask', task);
  }
}
