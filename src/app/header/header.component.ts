import {Component, Input, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService, User } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() currentUrl;
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  isScrolled = false;
  isNavbarOpen = false;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.user$ = this.authService.user$;
    this.isAdmin$ = this.adminService.isAdmin$;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScroll();
    }
  }

  ngOnDestroy() {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScroll();
  }

  private checkScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeNavbar() {
    this.isNavbarOpen = false;
  }

  signOut(): void {
    this.authService.signOut();
    this.closeNavbar();
  }
}
