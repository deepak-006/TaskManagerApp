import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { login } from '../../model/login';
import { userSignup } from '../../model/signup';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  //private baseUrl = 'https://localhost:7165/api';
  //private baseUrl = 'https://localhost:44390/api';
  private baseUrl = 'http://10.59.221.74:8090/api';
  

  constructor(private http: HttpClient) { }

  login(loginData: login): Observable<{ token: string, role: string, name: string }> {
    return this.http.post<{ token: string, role: string, name: string }>(
      `${this.baseUrl}/User/Login`,
      loginData
    );
  }

  signup(signupData: userSignup): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/User/Signup`,
      signupData
    );
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
