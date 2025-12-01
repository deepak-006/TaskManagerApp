import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../model/user';
import { Task } from '../../model/task';
import { LogEntry } from '../../model/log';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  //private baseUrl = 'https://localhost:7165/api';
  private baseUrl = 'https://localhost:44390/api';
  //private baseUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/AdminActivities/GetAllUsers`);
  }

  getAllTasks(pageNumber: number, pageSize: number) {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<Task[]>(`${this.baseUrl}/AdminActivities/GetAllTasks`, {
      observe: 'response',
      params
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/AdminActivities/deleteUser?userId=${userId}`);
  }

  updateUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/AdminActivities/UpdateUserRole?userId=${userId}&newRole=${newRole}`, {});
  }

  assignTaskToUser(task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/AdminActivities/AssignTask`, task);
  }

  getAllLogs(): Observable<LogEntry[]> {
    return this.http.get<LogEntry[]>(`${this.baseUrl}/AdminActivities/GetSystemLogs`);
  }
}
