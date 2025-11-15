import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../model/user';
import { Task } from '../../model/task';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('https://localhost:7165/api/AdminActivities/GetAllUsers');
  }

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('https://localhost:7165/api/AdminActivities/GetAllTasks');
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`https://localhost:7165/api/AdminActivities/deleteUser?userId=${userId}`);
  }

  updateUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.put(`https://localhost:7165/api/AdminActivities/UpdateUserRole?userId=${userId}&newRole=${newRole}`, {});
  }

  assignTaskToUser(task: Task): Observable<Task> {
    return this.http.post<Task>('https://localhost:7165/api/AdminActivities/AssignTask', task)
  }

}
