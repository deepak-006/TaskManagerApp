import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { login } from '../../model/login';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    const token = this.userService.getToken();
    const role = this.userService.getRole();

    if (token && role) {
      if (role === 'Admin') {
        this.router.navigate(['/adminDashboard']);
      } else if (role === 'User') {
        this.router.navigate(['/dashboard']);
      }
    }
  }


  onLogin() {
    const loginData: login = {
      email: this.email,
      password: this.password
    };

    this.userService.login(loginData).subscribe({
      next: (res) => {
        this.message = 'Login successful!';
        console.log('Token:', res.token + '\nRole:', res.role);
        this.userService.storeToken(res.token, res.name, res.role);
        if (res.role === 'Admin') {
          this.router.navigate(['/adminDashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }

        
      },
      error: () => {
        this.message = 'Invalid email or password';
      }
    });
  }
}
