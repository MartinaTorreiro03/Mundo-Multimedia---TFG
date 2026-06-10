import { Directive, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[scrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private observer!: IntersectionObserver;
  private revealed = false;

  constructor(private el: ElementRef) {}

  private timeoutId?: number;

  ngOnInit() {
    this.el.nativeElement.classList.add('scroll-reveal');

    this.timeoutId = window.setTimeout(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (!this.revealed && entry.isIntersecting && entry.intersectionRatio >= 0.15) {
              entry.target.classList.add('visible');
              this.revealed = true;
              this.observer.unobserve(this.el.nativeElement);
            }
          });
        },
        { threshold: [0, 0.15], rootMargin: '0px' }
      );

      this.observer.observe(this.el.nativeElement);
    }, 500);
  }

  ngOnDestroy() {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.observer?.disconnect();
  }
}
