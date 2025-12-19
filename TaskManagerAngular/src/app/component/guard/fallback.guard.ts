import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FallbackGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // 'Admin' | 'User'

    // ❌ Not authenticated → Landing page
    if (!token) {
      return this.router.createUrlTree(['/']);
    }

    // ✅ Authenticated → redirect by role
    if (role === 'Admin') {
      return this.router.createUrlTree(['/adminDashboard']);
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}
