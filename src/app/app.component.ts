import {Router, Event, NavigationStart, NavigationEnd, NavigationError, RouterOutlet} from '@angular/router';
import {Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { routeAnimations } from './route-animations';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations]
})
export class AppComponent implements OnInit, OnDestroy {
  public currentUrl = '';
  public showBackToTop = false;
  public scrollProgress = 0;
  private scrollObserver: IntersectionObserver | null = null;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.spinner.show();
        if (this.isBrowser) {
          window.scroll(0, 0);
        }
      }

      if (event instanceof NavigationEnd) {
        if (typeof gtag !== 'undefined') {
          gtag('config', 'G-2VMTXJHEJG', {
            page_path: event.urlAfterRedirects
          });
        }

        // Close mobile navbar if open
        if (this.isBrowser) {
          const toggler = document.querySelector('.navbar-toggler') as HTMLElement;
          const navbarCollapse = document.querySelector('.navbar-collapse');
          if (toggler && navbarCollapse && navbarCollapse.classList.contains('show')) {
            toggler.click();
          }
        }

        this.spinner.hide();
        this.currentUrl = this.router.url;

        if (this.isBrowser) {
          window.scroll(0, 0);
          setTimeout(() => this.initScrollAnimations(), 100);
        }
      }

      if (event instanceof NavigationError) {
        this.spinner.hide();
      }
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.initScrollAnimations();
    }
  }

  ngOnDestroy() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      this.showBackToTop = window.scrollY > 400;

      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    }
  }

  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    // Only access activatedRoute if the outlet is activated to avoid NG04012 error
    if (outlet && outlet.isActivated) {
      return outlet.activatedRouteData?.['animation'] || outlet.activatedRoute?.snapshot?.url?.toString() || '';
    }
    return '';
  }

  private initScrollAnimations() {
    if (!this.isBrowser) return;

    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('[data-animate], .stagger-children, .image-reveal, .text-reveal');
    animatedElements.forEach((el) => {
      this.scrollObserver?.observe(el);
    });
  }
}
