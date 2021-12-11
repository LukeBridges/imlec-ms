import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ScoreModel} from '../../../core/models/score.model';
import {Observable, Subject} from 'rxjs';
import {debounceTime, delay, filter, takeUntil} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';
import {ScoreboardImportsModule} from '../../scoreboardImports.module';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ScoreComponent implements OnInit, OnDestroy {
  @ViewChild('tableTop') tableTop: ElementRef;
  @ViewChild('tableEnd') tableEnd: ElementRef;
  private static TOP_WAIT = 30 * 1000;
  private static BOTTOM_WAIT = 20 * 1000;
  static SCROLL_TIME = 8 * 1000;

  public desktop = true;

  private ngUnsubscribe$: Subject<any> = new Subject<any>();

  private scrollDownEvent: Subject<boolean> = new Subject<boolean>();
  private scrollUpEvent: Subject<boolean> = new Subject<boolean>();
  private scrollingStarted = false;

  public scores: ScoreModel[];
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
    let top = element.scrollTop;

    if (element.scrollTop === 0) {
      ++element.scrollTop;
      element = (top + 1 === element.scrollTop--) ?
        element :
        this.document.querySelector('.mat-drawer-content');
    }

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
}

@NgModule({
  declarations: [ScoreComponent],
  imports: [ScoreboardImportsModule],
})
export class ScoreComponentModule {
}
