import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
  animateChild
} from '@angular/animations';

// Smooth fade and slide animation for page transitions
export const routeAnimations = trigger('routeAnimations', [
  // Default transition for all routes
  transition('* <=> *', [
    // Initial styles for entering/leaving pages
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 1
      })
    ], { optional: true }),

    // Leaving page fades out and slides up slightly
    query(':leave', [
      animate('300ms ease-out', style({
        opacity: 0,
        transform: 'translateY(-20px)'
      }))
    ], { optional: true }),

    // Entering page fades in and slides up from below
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(30px)'
      }),
      animate('400ms 100ms ease-out', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ], { optional: true }),

    // Trigger child animations
    query(':enter', animateChild(), { optional: true })
  ])
]);

// Alternative: Elegant crossfade
export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),

    group([
      query(':leave', [
        animate('250ms ease-out', style({
          opacity: 0
        }))
      ], { optional: true }),

      query(':enter', [
        style({ opacity: 0 }),
        animate('350ms 150ms ease-in', style({
          opacity: 1
        }))
      ], { optional: true })
    ])
  ])
]);

// Alternative: Slide animation (horizontal)
export const slideAnimation = trigger('slideAnimation', [
  transition('* => *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),

    group([
      query(':leave', [
        animate('300ms ease-out', style({
          opacity: 0,
          transform: 'translateX(-50px)'
        }))
      ], { optional: true }),

      query(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(50px)'
        }),
        animate('400ms ease-out', style({
          opacity: 1,
          transform: 'translateX(0)'
        }))
      ], { optional: true })
    ])
  ])
]);
