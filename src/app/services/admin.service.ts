import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminEmails = [
    'vani@workshopno5.com',
    'bryon.bowers@gmail.com'
  ];

  isAdmin$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isAdmin$ = this.authService.user$.pipe(
      map(user => {
        if (!user || !user.email) {
          return false;
        }
        return this.adminEmails.includes(user.email.toLowerCase());
      })
    );
  }

  isAdminEmail(email: string): boolean {
    return this.adminEmails.includes(email.toLowerCase());
  }
}
