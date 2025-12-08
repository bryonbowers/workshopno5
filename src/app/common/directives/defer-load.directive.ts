import { Directive, ElementRef, EventEmitter, Output, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[deferLoad]'
})
export class DeferLoadDirective implements OnInit, OnDestroy {
  @Output() deferLoad = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) {
      this.deferLoad.emit();
      return;
    }

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.deferLoad.emit();
              this.observer?.unobserve(this.el.nativeElement);
            }
          });
        },
        {
          rootMargin: '100px',
          threshold: 0.01
        }
      );
      this.observer.observe(this.el.nativeElement);
    } else {
      this.deferLoad.emit();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
