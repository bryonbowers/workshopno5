import { Component, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';

interface Snowflake {
  id: number;
  x: number;
  baseX: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
  rotation: number;
  rotationSpeed: number;
}

@Component({
  selector: 'app-water-effect',
  templateUrl: './water-effect.component.html',
  styleUrls: ['./water-effect.component.scss']
})
export class WaterEffectComponent implements OnInit, OnDestroy {
  snowflakes: Snowflake[] = [];

  private mouseX = -1000;
  private mouseY = -1000;
  private animationFrame: number | null = null;
  private lastTime = 0;
  private interactionRadius = 100;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.initializeSnowflakes();

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

  private initializeSnowflakes(): void {
    // Create 60 snowflakes spread across the screen
    this.snowflakes = Array.from({ length: 60 }, (_, i) => this.createSnowflake(i, true));
  }

  private createSnowflake(id: number, randomY: boolean = false): Snowflake {
    return {
      id,
      x: Math.random() * 100,
      baseX: Math.random() * 100,
      y: randomY ? Math.random() * 100 : -5 - Math.random() * 10,
      size: 3 + Math.random() * 8, // 3-11px
      speed: 0.015 + Math.random() * 0.025, // slow falling
      opacity: 0.3 + Math.random() * 0.5,
      wobble: 0,
      wobbleSpeed: 0.5 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2
    };
  }

  private animate(time: number): void {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    if (deltaTime > 0) {
      this.updateSnowflakes(deltaTime);
    }

    this.animationFrame = requestAnimationFrame((t) => this.animate(t));
  }

  private updateSnowflakes(deltaTime: number): void {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.snowflakes.forEach(flake => {
      // Gentle falling
      flake.y += flake.speed * deltaTime;

      // Wobble side to side
      flake.wobble += flake.wobbleSpeed * deltaTime * 0.01;
      const wobbleOffset = Math.sin(flake.wobble) * 0.3;

      // Rotate
      flake.rotation += flake.rotationSpeed * deltaTime * 0.05;

      // Calculate pixel position for mouse interaction
      const flakePixelX = (flake.baseX / 100) * viewportWidth;
      const flakePixelY = (flake.y / 100) * viewportHeight;

      // Mouse interaction - push snowflakes away gently
      const dx = this.mouseX - flakePixelX;
      const dy = this.mouseY - flakePixelY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.interactionRadius) {
        const force = (this.interactionRadius - distance) / this.interactionRadius;
        const pushX = (dx > 0 ? -1 : 1) * force * 3;
        const pushY = (dy > 0 ? -1 : 1) * force * 2;
        flake.x = flake.baseX + wobbleOffset + pushX;
        flake.y += pushY * 0.1;
      } else {
        flake.x = flake.baseX + wobbleOffset;
      }

      // Reset when off screen
      if (flake.y > 105) {
        flake.y = -5;
        flake.baseX = Math.random() * 100;
        flake.x = flake.baseX;
        flake.size = 3 + Math.random() * 8;
        flake.speed = 0.015 + Math.random() * 0.025;
        flake.opacity = 0.3 + Math.random() * 0.5;
      }
    });
  }

  getSnowflakeStyle(flake: Snowflake) {
    return {
      left: flake.x + '%',
      top: flake.y + '%',
      width: flake.size + 'px',
      height: flake.size + 'px',
      opacity: flake.opacity,
      transform: `rotate(${flake.rotation}deg)`
    };
  }
}
