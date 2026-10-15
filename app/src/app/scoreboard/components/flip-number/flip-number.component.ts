import {Component, ElementRef, Inject, Input, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, signal} from '@angular/core';

@Component({
    selector: 'app-flip-number',
    templateUrl: './flip-number.component.html',
    styleUrls: ['./flip-number.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class FlipNumberComponent implements OnChanges, OnDestroy {
  private static readonly TICK_MS = 90;
  private static readonly FLIP_MS = 150;

  @Input() value = 0;

  public displayValue = signal(0);
  public flip = signal(false);

  // @ts-ignore
  private tickTimer: ReturnType<typeof setInterval>;
  // @ts-ignore
  private flipTimer: ReturnType<typeof setTimeout>;

  constructor(@Inject(ElementRef) private el: ElementRef<HTMLElement>) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['value'];
    if (!change) return;
    if (change.firstChange) {
      this.displayValue.set(change.currentValue);
      return;
    }
    if (change.currentValue === change.previousValue) return;
    this.tickTo(change.currentValue, change.previousValue);
  }

  ngOnDestroy(): void {
    clearInterval(this.tickTimer);
    clearTimeout(this.flipTimer);
  }

  private tickTo(target: number, from: number): void {
    clearInterval(this.tickTimer);
    if (this.reducedMotion()) {
      this.displayValue.set(target);
      return;
    }
    const step = target > from ? 1 : -1;
    let current = from;
    this.tickTimer = setInterval(() => {
      current += step;
      this.displayValue.set(current);
      this.playFlip();
      if (current === target) {
        clearInterval(this.tickTimer);
      }
    }, FlipNumberComponent.TICK_MS);
  }

  private playFlip(): void {
    clearTimeout(this.flipTimer);
    this.flip.set(false);
    // force a reflow so the browser registers the "false" state before re-adding it,
    // otherwise the CSS animation never restarts for consecutive ticks.
    void this.el.nativeElement.offsetHeight;
    this.flip.set(true);
    this.flipTimer = setTimeout(() => this.flip.set(false), FlipNumberComponent.FLIP_MS);
  }

  // istanbul ignore next
  private reducedMotion(): boolean {
    return typeof window !== 'undefined'
      && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }
}
