import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { login } from '../../model/login';
import { userSignup } from '../../model/signup';
import { Observable } from 'rxjs';
@Injectable(
  { providedIn: 'root' }
)
export class UserService
{
  constructor(private http: HttpClient) { }

  login(loginData: login): Observable<{ token: string, role: string, name :string }>
  {
    return this.http.post<{ token: string, role: string, name: string }>('https://localhost:7165/api/User/Login', loginData);
  }

  signup(signupData: userSignup): Observable<any> {
    return this.http.post<any>('https://localhost:7165/api/User/Signup', signupData);
  }

  storeToken(token: string, name: string): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('name', name);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUserName(): string | null {
    return sessionStorage.getItem('name');
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('name');
  }
}
