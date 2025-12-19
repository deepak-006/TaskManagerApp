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
  private baseUrl = 'https://localhost:44390/api';
  //private baseUrl = 'http://localhost:8090/api'; 
  

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

  getProfile(): Observable<userSignup> {
    return this.http.get<userSignup>(
      `${this.baseUrl}/User/GetCurrentUser`
    );
  }

  updateProfile(profile :userSignup): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/User/UpdateProfile`, profile
    );
  }

  storeToken(token: string, name: string, role: string): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('name', name);
    sessionStorage.setItem('role', role);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getUserName(): string | null {
    return sessionStorage.getItem('name');
  }

  getRole(): string | null {
    return sessionStorage.getItem('role');
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('role');
  }
}







