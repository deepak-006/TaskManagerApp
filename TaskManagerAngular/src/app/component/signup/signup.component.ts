import { Component } from '@angular/core';
import { UserService } from '../../service/user/user.service';
import { userSignup } from '../../model/signup';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  firstName: string = '';
  lastName: string = '';
  dateOfBirth: string = '';
  email: string = '';
  password: string = '';
  isAdmin: boolean = false; // Checkbox for admin selection
  message: string = '';

  constructor(private userService: UserService, private router: Router) { }

  onSignup() {
    const role = this.isAdmin ? 'Admin' : 'User'; // assign role based on checkbox

    const signupData: userSignup = {
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      email: this.email,
      password: this.password,
      role: role
    };

    this.userService.signup(signupData).subscribe({
      next: (res) => {
        this.message = `Signup successful as ${role}!`;
        console.log('Signup Response:', res);

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.message = 'Signup failed. Please try again.';
        console.error('Signup Error:', err);
      }
    });
  }
}
