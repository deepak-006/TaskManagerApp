import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user/user.service';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isMenuOpen = false;
  userRole: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private app: AppComponent
  ) { }

  ngOnInit() {
    this.userRole = this.userService.getRole();   // ⭐ get role here
    this.applyNavbarTheme();
  }

  /** Apply dark/light mode to navbar directly */
  applyNavbarTheme() {
    const navbar = document.querySelector('.main-navbar');
    if (!navbar) return;

    if (this.isDarkMode) navbar.classList.add('dark-mode');
    else navbar.classList.remove('dark-mode');
  }

  /** ⭐ Check if user is admin */
  get isAdmin(): boolean {
    return this.userRole?.toLowerCase() === "admin";
  }

  get userName() {
    return this.userService.getUserName() ?? "";
  }

  get userInitials() {
    const p = this.userName.split(" ");
    return p.length >= 2
      ? (p[0][0] + p[1][0]).toUpperCase()
      : p[0][0].toUpperCase();
  }

  get isDarkMode() {
    return this.app.isDarkMode;
  }

  toggleTheme() {
    this.app.toggleTheme();
    this.applyNavbarTheme();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.isMenuOpen = false;
  }

  /** ⭐ Admin mode */
  goToAdmin() {
    this.router.navigate(['/adminDashboard']);
    this.isMenuOpen = false;
  }

  /** ⭐ User mode */
  goToUserDashboard() {
    this.router.navigate(['/dashboard']);
    this.isMenuOpen = false;
  }

  confirmLogout() {
    if (confirm("Do you want to logout?")) {
      this.userService.logout();
      this.router.navigate(['/login']);
    }
  }
}
