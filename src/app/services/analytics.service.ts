import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private isGtagLoaded = false;

  constructor(private router: Router) {
    // Check if gtag is loaded
    this.checkGtagLoaded();
    
    // Track route changes
    this.trackRouteChanges();
  }

  private checkGtagLoaded(): void {
    if (typeof gtag !== 'undefined') {
      this.isGtagLoaded = true;
    } else {
      // Retry after a short delay
      setTimeout(() => this.checkGtagLoaded(), 100);
    }
  }

  private trackRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  // Track page views
  trackPageView(url: string): void {
    if (this.isGtagLoaded) {
      // TODO: Replace G-2VMTXJHEJG with your actual GA4 measurement ID from Firebase Console
      gtag('config', 'G-2VMTXJHEJG', {
        page_path: url,
        page_title: document.title,
        page_location: window.location.origin + url
      });
    }
  }

  // Track project clicks
  trackProjectClick(projectName: string, projectType: 'residential' | 'commercial'): void {
    if (this.isGtagLoaded) {
      gtag('event', 'project_click', {
        event_category: 'engagement',
        event_label: projectName,
        custom_parameter_1: projectType,
        value: 1
      });
    }
  }

  // Track navigation clicks
  trackNavigation(navigationItem: string): void {
    if (this.isGtagLoaded) {
      gtag('event', 'navigation_click', {
        event_category: 'navigation',
        event_label: navigationItem,
        value: 1
      });
    }
  }

  // Track contact form interactions
  trackContactFormEvent(action: 'start' | 'submit' | 'complete', formName?: string): void {
    if (this.isGtagLoaded) {
      gtag('event', 'contact_form_' + action, {
        event_category: 'form_interaction',
        event_label: formName || 'contact_us',
        value: action === 'complete' ? 10 : 1
      });
    }
  }

  // Track portfolio image clicks
  trackPortfolioImageClick(projectName: string, imageIndex: number): void {
    if (this.isGtagLoaded) {
      gtag('event', 'portfolio_image_click', {
        event_category: 'engagement',
        event_label: projectName,
        custom_parameter_1: imageIndex.toString(),
        value: 1
      });
    }
  }

  // Track external link clicks
  trackExternalLink(url: string, linkText: string): void {
    if (this.isGtagLoaded) {
      gtag('event', 'external_link_click', {
        event_category: 'outbound',
        event_label: url,
        custom_parameter_1: linkText,
        value: 1
      });
    }
  }

  // Track scroll depth
  trackScrollDepth(percentage: number): void {
    if (this.isGtagLoaded) {
      gtag('event', 'scroll_depth', {
        event_category: 'engagement',
        event_label: percentage + '%',
        value: percentage
      });
    }
  }

  // Track consultation requests
  trackConsultationRequest(serviceType: string): void {
    if (this.isGtagLoaded) {
      gtag('event', 'consultation_request', {
        event_category: 'conversion',
        event_label: serviceType,
        value: 20
      });
    }
  }

  // Track awards section views
  trackAwardsView(): void {
    if (this.isGtagLoaded) {
      gtag('event', 'awards_section_view', {
        event_category: 'engagement',
        event_label: 'awards_recognition',
        value: 1
      });
    }
  }

  // Track blog interactions
  trackBlogInteraction(action: 'view' | 'click', blogTitle?: string): void {
    if (this.isGtagLoaded) {
      gtag('event', 'blog_' + action, {
        event_category: 'content',
        event_label: blogTitle || 'blog_section',
        value: 1
      });
    }
  }

  // Custom event tracking for any additional needs
  trackCustomEvent(eventName: string, category: string, label?: string, value?: number): void {
    if (this.isGtagLoaded) {
      gtag('event', eventName, {
        event_category: category,
        event_label: label,
        value: value || 1
      });
    }
  }
}