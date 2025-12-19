import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { UserService } from '../../service/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    const token = this.userService.getToken();
    const role = this.userService.getRole();

    // ❌ Not logged in → login page
    if (!token || !role) {
      return this.router.createUrlTree(['/login']);
    }

    // ✅ Admin trying to access user dashboard → redirect
    if (state.url === '/dashboard' && role === 'Admin') {
      return this.router.createUrlTree(['/adminDashboard']);
    }

    // ❌ User trying to access admin dashboard
    if (state.url === '/adminDashboard' && role !== 'Admin') {
      return this.router.createUrlTree(['/dashboard']);
    }

    return true; // ✅ allow navigation
  }
}
