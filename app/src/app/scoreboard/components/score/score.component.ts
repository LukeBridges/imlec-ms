import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  DOCUMENT,
  ChangeDetectionStrategy
} from '@angular/core';
import {ScoreModel} from '../../../core/models/score.model';
import {Observable, Subject} from 'rxjs';
import {debounceTime, delay, filter, takeUntil} from 'rxjs/operators';
import {MatRow, MatTableModule} from '@angular/material/table';
import {MatRippleModule} from '@angular/material/core';
import {DetailRowDirective} from '../../directives/detail-row.directive';
import {FlipNumberComponent} from '../flip-number/flip-number.component';

@Component({
    selector: 'app-score',
    templateUrl: './score.component.html',
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatTableModule, MatRippleModule, DetailRowDirective, FlipNumberComponent]
})
export class ScoreComponent implements OnInit, OnDestroy {
  // @ts-ignore
  @ViewChild('tableTop') tableTop: ElementRef;
  // @ts-ignore
  @ViewChild('tableEnd') tableEnd: ElementRef;
  // @ts-ignore
  @ViewChildren(MatRow, {read: ElementRef}) rowEls: QueryList<ElementRef<HTMLElement>>;
  private static TOP_WAIT = 30 * 1000;
  private static BOTTOM_WAIT = 20 * 1000;
  static SCROLL_TIME = 8 * 1000;

  public desktop = true;

  private ngUnsubscribe$: Subject<any> = new Subject<any>();

  private scrollDownEvent: Subject<boolean> = new Subject<boolean>();
  private scrollUpEvent: Subject<boolean> = new Subject<boolean>();
  private scrollingStarted = false;

  // @ts-ignore
  public scores: ScoreModel[];
  // @ts-ignore
  public completeScores: Observable<ScoreModel[]>;

  displayedColumns: string[] = [
    'place',
    'runNo',
    'gauge',
    'loco',
    'driversName',
    'driversClub',
    'load',
    'runningTime',
    'distanceTravelled',
    'workDone',
    'averageHP',
    'coalUsed',
    'overallThermalEfficiency',
  ];

  showToolbar = true;

  constructor(
    @Inject(DOCUMENT) protected document: Document,
    @Inject(ChangeDetectorRef) public changeDetection: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.completeScores.pipe(
      takeUntil(this.ngUnsubscribe$),
      filter(scores => JSON.stringify(scores) !== JSON.stringify(this.scores)),
    ).subscribe(scores => {
      this.scores = scores;
    });
  }

  ngOnDestroy(): void {
    this.scrollUpEvent.complete();
    this.scrollDownEvent.complete();
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  @HostListener('document:keydown.shift.f') toggleToolbar() {
    this.showToolbar = !this.showToolbar;
    this.setScrolling();
    if (!this.scrollingStarted) {
      this.scrollDownEvent.next(true);
    }
    if (!this.showToolbar) {
      this.scrollingStarted = true;
    }
  }

  scrollTop() {
    return this.scrollTo(this.tableTop.nativeElement.offsetTop,
      ScoreComponent.SCROLL_TIME);
  }

  scrollBottom() {
    return this.scrollTo(this.tableEnd.nativeElement.offsetTop,
      ScoreComponent.SCROLL_TIME * 2);
  }

  // istanbul ignore next
  scrollTo(to: number, duration: number) {
    let element = this.document.querySelector('.mat-drawer-content');
    if(!element) return;

    let top = element.scrollTop;

    if (element.scrollTop === 0) {
      ++element.scrollTop;
      element = (top + 1 === element.scrollTop--) ?
        element :
        this.document.querySelector('.mat-drawer-content');
    }

    // @ts-ignore
    return this.scrollToX(element, top, to, 0, 1 / duration, 20);
  };

  // istanbul ignore next
  scrollToX(element: Element, xFrom: number, xTo: number, t01: number,
            speed: number, step: number) {
    if (t01 < 0 || t01 > 1 || speed <= 0) {
      element.scrollTop = xTo;
      return;
    }
    element.scrollTop = xFrom - (xFrom - xTo) * t01;
    t01 += speed * step;

    setTimeout(() => {
      this.scrollToX(element, xFrom, xTo, t01, speed, step);
    }, step);
  }

  // istanbul ignore next
  setScrolling() {
    this.scrollDownEvent.pipe(
      takeUntil(this.ngUnsubscribe$),
      debounceTime(200),
      filter(val => !!val),
      delay(ScoreComponent.TOP_WAIT),
    ).subscribe(() => {
      if (!this.showToolbar) {
        this.scrollBottom();
      }
      setTimeout(() => {
        this.scrollUpEvent.next(true);
      }, ScoreComponent.SCROLL_TIME);
    });

    this.scrollUpEvent.pipe(
      takeUntil(this.ngUnsubscribe$),
      debounceTime(200),
      filter(val => !!val),
      delay(ScoreComponent.BOTTOM_WAIT),
    ).subscribe(() => {
      if (!this.showToolbar) {
        this.scrollTop();
      }
      setTimeout(() => {
        this.scrollDownEvent.next(true);
      }, ScoreComponent.SCROLL_TIME);
    });
  }

  // istanbul ignore next
  score = (element: any) => element as ScoreModel;

  hasScored(element: any): boolean {
    return typeof this.score(element).score === 'number';
  }

  private previousPlaces: Map<number, number> = new Map<number, number>();
  private previousScores: Map<number, number | 'dnf' | null> = new Map<number, number | 'dnf' | null>();

  private scoreSignature(score: ScoreModel): number | 'dnf' | null {
    if (typeof score.score === 'number') return score.score;
    return score.dnf ? 'dnf' : null;
  }

  captureRowRects(): Map<number, DOMRect> {
    this.resetRowStyles();
    const rects = new Map<number, DOMRect>();
    this.rowEls?.forEach((ref, i) => {
      const score = this.scores?.[i];
      if (!score) return;
      rects.set(score.runNo, ref.nativeElement.getBoundingClientRect());
      this.previousPlaces.set(score.runNo, i + 1);
      this.previousScores.set(score.runNo, this.scoreSignature(score));
    });
    return rects;
  }

  // istanbul ignore next
  private resetRowStyles(): void {
    this.rowEls?.forEach(ref => {
      const el = ref.nativeElement;
      el.style.transition = 'none';
      el.style.transitionDelay = '';
      el.style.transform = '';
      el.style.opacity = '';
      el.style.zIndex = '';
      el.classList.remove('row-landed');
    });
  }

  trend(runNo: number, place: number): 'up' | 'down' | 'same' {
    const prev = this.previousPlaces.get(runNo);
    if (prev === undefined || prev === place) return 'same';
    return place < prev ? 'up' : 'down';
  }

  // istanbul ignore next
  playFlap(prevRects: Map<number, DOMRect>): void {
    if (!prevRects.size || this.reducedMotion()) return;

    const movers = new Set<number>();
    this.scores?.forEach(score => {
      if (this.previousScores.get(score.runNo) !== this.scoreSignature(score)) movers.add(score.runNo);
    });

    this.rowEls?.forEach((ref, i) => {
      const score = this.scores?.[i];
      if (!score) return;
      const prev = prevRects.get(score.runNo);
      if (!prev) return;
      const el = ref.nativeElement;
      const next = el.getBoundingClientRect();
      const deltaY = prev.top - next.top;
      if (Math.abs(deltaY) < 1) return;

      if (movers.has(score.runNo)) {
        this.flapMover(el, deltaY, next.height || 1);
      } else {
        this.slideDisplaced(el, deltaY);
      }
    });
  }

  // istanbul ignore next
  private flapMover(el: HTMLElement, deltaY: number, rowHeight: number): void {
    const duration = Math.round(Math.max(1, Math.abs(deltaY) / rowHeight) * 1000);

    el.style.transformOrigin = 'top center';
    el.style.transition = 'none';
    el.style.transform = `translateY(${deltaY}px) rotateX(-65deg)`;
    el.style.opacity = '0.4';
    el.style.zIndex = '10';
    void el.offsetHeight;
    el.style.transition = `transform ${duration}ms cubic-bezier(.22,1.2,.36,1), opacity ${Math.min(duration, 300)}ms ease`;
    el.style.transform = 'translateY(0) rotateX(0deg)';
    el.style.opacity = '1';
    el.style.animationDuration = `${duration + 400}ms`;
    el.classList.add('row-landed');
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform') return;
      el.style.transition = '';
      el.style.zIndex = '';
      el.removeEventListener('transitionend', onTransitionEnd);
    };
    el.addEventListener('transitionend', onTransitionEnd);
    el.addEventListener('animationend', () => {
      el.classList.remove('row-landed');
      el.style.animationDuration = '';
    }, {once: true});
  }

  // istanbul ignore next
  private slideDisplaced(el: HTMLElement, deltaY: number): void {
    el.style.transition = 'none';
    el.style.zIndex = '1';
    el.style.transform = `translateY(${deltaY}px)`;
    void el.offsetHeight;
    el.style.transition = 'transform 300ms ease-out';
    el.style.transform = 'translateY(0)';
    el.addEventListener('transitionend', () => {
      el.style.transition = '';
      el.style.zIndex = '';
    }, {once: true});
  }

  // istanbul ignore next
  private reducedMotion(): boolean {
    return typeof window !== 'undefined'
      && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }
}
