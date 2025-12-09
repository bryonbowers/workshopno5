import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.adminService.isAdmin$.pipe(
      take(1),
      map(isAdmin => {
        if (isAdmin) {
          return true;
        }
        // Redirect to login if not authenticated, or home if authenticated but not admin
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
