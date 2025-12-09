import { Component, OnInit, OnDestroy, HostListener, ElementRef, NgZone } from '@angular/core';

interface WaterStream {
  id: number;
  x: number;
  baseX: number;
  y: number;
  height: number;
  speed: number;
  delay: number;
  deflection: number;
  deflectionTarget: number;
}

interface MistParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
}

interface Droplet {
  id: number;
  x: number;
  y: number;
  speed: number;
  active: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  active: boolean;
}

@Component({
  selector: 'app-water-effect',
  templateUrl: './water-effect.component.html',
  styleUrls: ['./water-effect.component.scss']
})
export class WaterEffectComponent implements OnInit, OnDestroy {
  streams: WaterStream[] = [];
  mistParticles: MistParticle[] = [];
  droplets: Droplet[] = [];
  ripples: Ripple[] = [];

  private mouseX = -1000;
  private mouseY = -1000;
  private animationFrame: number | null = null;
  private lastTime = 0;
  private poolHeight = 120;
  private interactionRadius = 80;

  constructor(private ngZone: NgZone, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.initializeStreams();
    this.initializeMist();
    this.initializeDroplets();
    this.initializeRipples();

    // Run animation outside Angular zone for performance
    this.ngZone.runOutsideAngular(() => {
      this.animate(0);
    });
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  @HostListener('document:mouseleave')
  onMouseLeave(): void {
    this.mouseX = -1000;
    this.mouseY = -1000;
  }

  private initializeStreams(): void {
    const positions = [8, 18, 32, 48, 62, 76, 88, 95];
    this.streams = positions.map((x, i) => ({
      id: i,
      x: x,
      baseX: x,
      y: -50,
      height: 150 + Math.random() * 100,
      speed: 0.08 + Math.random() * 0.04,
      delay: Math.random() * 8000,
      deflection: 0,
      deflectionTarget: 0
    }));
  }

  private initializeMist(): void {
    this.mistParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 0,
      size: 60 + Math.random() * 60,
      speed: 0.02 + Math.random() * 0.02,
      delay: Math.random() * 12000,
      opacity: 0
    }));
  }

  private initializeDroplets(): void {
    this.droplets = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: Math.random() * -100,
      speed: 0.1 + Math.random() * 0.1,
      active: true
    }));
  }

  private initializeRipples(): void {
    this.ripples = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + (i * 12),
      y: 0,
      scale: 0,
      opacity: 0,
      active: false
    }));
  }

  private animate(time: number): void {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.updateStreams(deltaTime);
    this.updateMist(deltaTime);
    this.updateDroplets(deltaTime);
    this.updateRipples(deltaTime);

    this.animationFrame = requestAnimationFrame((t) => this.animate(t));
  }

  private updateStreams(deltaTime: number): void {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    this.streams.forEach(stream => {
      // Update Y position
      stream.y += stream.speed * deltaTime;

      // Reset when off screen
      if (stream.y > viewportHeight + stream.height) {
        stream.y = -stream.height - 50;
        stream.delay = 0;
      }

      // Calculate stream position in pixels
      const streamPixelX = (stream.baseX / 100) * viewportWidth;

      // Check mouse interaction
      const dx = this.mouseX - streamPixelX;
      const dy = this.mouseY - stream.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.interactionRadius && stream.y > 0 && stream.y < viewportHeight) {
        // Calculate deflection - push water away from mouse
        const force = (this.interactionRadius - distance) / this.interactionRadius;
        const deflectDirection = dx > 0 ? -1 : 1;
        stream.deflectionTarget = deflectDirection * force * 60;
      } else {
        // Gradually return to original position
        stream.deflectionTarget = 0;
      }

      // Smooth deflection
      stream.deflection += (stream.deflectionTarget - stream.deflection) * 0.1;
      stream.x = stream.baseX + (stream.deflection / viewportWidth) * 100;
    });
  }

  private updateMist(deltaTime: number): void {
    const viewportHeight = window.innerHeight;

    this.mistParticles.forEach(particle => {
      particle.y += particle.speed * deltaTime;

      // Fade in and out
      if (particle.y < 50) {
        particle.opacity = Math.min(0.4, particle.y / 50 * 0.4);
      } else if (particle.y > 150) {
        particle.opacity = Math.max(0, (200 - particle.y) / 50 * 0.4);
      }

      // Reset
      if (particle.y > 200) {
        particle.y = 0;
        particle.x = 5 + Math.random() * 90;
        particle.opacity = 0;
      }
    });
  }

  private updateDroplets(deltaTime: number): void {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    this.droplets.forEach(droplet => {
      droplet.y += droplet.speed * deltaTime;

      // Check mouse collision for droplets too
      const dropletPixelX = (droplet.x / 100) * viewportWidth;
      const dropletPixelY = (droplet.y / 100) * viewportHeight;
      const dx = this.mouseX - dropletPixelX;
      const dy = this.mouseY - dropletPixelY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50) {
        // Splash away from mouse
        droplet.x += (dx > 0 ? -2 : 2);
      }

      // Reset
      if (droplet.y > 100) {
        droplet.y = -10;
        droplet.x = 5 + Math.random() * 90;

        // Trigger a ripple
        const availableRipple = this.ripples.find(r => !r.active);
        if (availableRipple) {
          availableRipple.x = droplet.x;
          availableRipple.scale = 0.5;
          availableRipple.opacity = 0.4;
          availableRipple.active = true;
        }
      }
    });
  }

  private updateRipples(deltaTime: number): void {
    this.ripples.forEach(ripple => {
      if (ripple.active) {
        ripple.scale += 0.002 * deltaTime;
        ripple.opacity -= 0.0003 * deltaTime;

        if (ripple.opacity <= 0) {
          ripple.active = false;
          ripple.scale = 0;
          ripple.opacity = 0;
        }
      }
    });
  }

  getStreamStyle(stream: WaterStream) {
    return {
      left: stream.x + '%',
      top: stream.y + 'px',
      height: stream.height + 'px',
      opacity: stream.y > 0 ? 1 : 0
    };
  }

  getMistStyle(particle: MistParticle) {
    return {
      left: particle.x + '%',
      bottom: particle.y + 'px',
      width: particle.size + 'px',
      height: particle.size + 'px',
      opacity: particle.opacity
    };
  }

  getDropletStyle(droplet: Droplet) {
    return {
      left: droplet.x + '%',
      top: droplet.y + '%',
      opacity: droplet.y > 0 && droplet.y < 95 ? 0.6 : 0
    };
  }

  getRippleStyle(ripple: Ripple) {
    return {
      left: ripple.x + '%',
      transform: `scale(${ripple.scale})`,
      opacity: ripple.opacity
    };
  }
}
