import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective {
  @Input() tiltMax = 10;
  @Input() tiltPerspective = 900;
  @Input() tiltScale = 1.02;

  constructor(private el: ElementRef<HTMLElement>) {
    const element = this.el.nativeElement;
    element.style.transformStyle = 'preserve-3d';
    element.style.willChange = 'transform';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const element = this.el.nativeElement;
    const rect = element.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const px = x / rect.width; // 0..1
    const py = y / rect.height; // 0..1

    const rotateY = (px - 0.5) * (this.tiltMax * 2);
    const rotateX = (0.5 - py) * (this.tiltMax * 2);

    element.style.transform = `perspective(${this.tiltPerspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${this.tiltScale})`;
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    const element = this.el.nativeElement;
    element.style.transition = 'transform 120ms ease';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    const element = this.el.nativeElement;
    element.style.transition = 'transform 180ms ease';
    element.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }
}
