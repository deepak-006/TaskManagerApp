import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  showNavbar = true;
  isDarkMode = false;

  constructor(private router: Router) {

    /* ⭐ Load theme from localStorage ⭐ */
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    // ⭐ APPLY THE THEME TO BODY ON STARTUP
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    /* ⭐ Handle navbar visibility ⭐ */
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        const url = event.urlAfterRedirects;

        this.showNavbar = !(
          url === '/' ||
          url === '' ||
          url === '/home' ||
          url.startsWith('/login') ||
          url.startsWith('/signup')
        );
      }
    });
  }

  /* ⭐ GLOBAL Dark Mode Toggle ⭐ */
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }
}
