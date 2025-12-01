import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../model/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  //private baseUrl = 'https://localhost:7165/api';
  //private baseUrl = 'https://localhost:44390/api';
  private baseUrl = 'http://10.59.221.74:8090/api';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/Task/GetTasks`);
  }

  deleteTask(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/Task/DeleteTask?taskId=${id}`
    );
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/Task/CreateTask`, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/Task/UpdateTask`, task);
  }
}
