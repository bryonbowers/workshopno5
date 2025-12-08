import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  user$: Observable<User | null>;
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.user$;
  }

  async signInWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err.message || 'An error occurred during sign in';
    } finally {
      this.isLoading = false;
    }
  }

  async signOut(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.signOut();
    } catch (err: any) {
      this.error = err.message || 'An error occurred during sign out';
    } finally {
      this.isLoading = false;
    }
  }
}
