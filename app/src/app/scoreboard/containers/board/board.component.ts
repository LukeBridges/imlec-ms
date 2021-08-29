import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  HostListener,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {ScoreModel} from '../../../core/models/score.model';
import {Observable, Subject} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {getScores} from '../../selectors/scores.selector';
import {filter, takeUntil} from 'rxjs/operators';
import * as ScoresActions from '../../actions/scores.actions';
import * as EntriesActions from '../../../listings/actions/entries.actions';
import {LocoModel} from '../../../core/models/loco.model';
import {getEntries} from '../../../listings/selectors/entries.selector';
import {State} from '../../../core/models/state.model';
import {WINDOW} from '../../../core/services/window.service';
import {ScoreComponent} from '../../components/score/score.component';

@Component({
  selector: 'app-imlec-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BoardComponent implements OnInit, OnDestroy {
  public scores$: Observable<ScoreModel[]>;
  public scores: ScoreModel[];
  private rawScores: string;
  public entries$: Observable<LocoModel[]>;
  public entries: LocoModel[];
  private completeScores: Subject<ScoreModel[]> = new Subject<ScoreModel[]>();

  public innerWidth: number;

  protected ngUnsubscribe$: Subject<any> = new Subject<any>();

  public static SCORE_REFRESH = 30 * 1000;

  private scoreInterval: number;

  public isMobile = false;

  private scoreInstance: ScoreComponent;

  @ViewChild('scoreContainer', {read: ViewContainerRef})
  scoreContainer: ViewContainerRef;

  constructor(
    @Inject(Store) public store: Store<State>,
    @Inject(WINDOW) public window: Window,
    @Inject(ComponentFactoryResolver) private cfr: ComponentFactoryResolver,
    @Inject(Injector) private injector: Injector) {
    this.scores$ = this.store.pipe(select(getScores));
    this.scores = [];
    this.rawScores = '';
    this.entries$ = this.store.pipe(select(getEntries));
    this.entries = [];
  }

  async ngOnInit() {
    this.innerWidth = this.window.innerWidth;
    this.isMobile = this.innerWidth <= 600;

    this.entries$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((entries: LocoModel[]) => {
      if (!entries || entries && entries.length < 1) {
        this.store.dispatch(EntriesActions.getEntries());
      } else {
        this.entries = entries;
        this.store.dispatch(ScoresActions.getScores());
      }
    });
    this.scores$.pipe(
      filter(scores => !!(scores && scores.length)),
      filter(scores => JSON.stringify(scores) !== this.rawScores),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((scores: ScoreModel[]) => {
      this.rawScores = JSON.stringify(scores);
      this.scores = [];
      scores.forEach(score => {
        this.scores.push(new ScoreModel({
          ...score,
          loco: this.entries.find(entry => entry.runNo === score.runNo),
        }));
      });
      this.ngOnChanges();
    });
    this.scoreInterval = this.window.setInterval(() => {
      this.store.dispatch(ScoresActions.getScores());
    }, BoardComponent.SCORE_REFRESH);
  }

  async ngOnChanges() {
    this.isMobile = this.innerWidth <= 600;
    if (!this.scoreInstance || this.isMobile === this.scoreInstance.desktop) {
      this.scoreInstance = await this.getScoreComponent();
      this.scoreInstance.completeScores = this.completeScores;
      this.scoreInstance.ngOnInit();
    }
    if (this.hasScores) {
      this.completeScores.next(this.scores);
      this.scoreInstance.changeDetection.detectChanges();
    }
  }

  async getScoreComponent(): Promise<ScoreComponent> {
    let scoreFactory: ComponentFactory<ScoreComponent>;
    if (this.isMobile) {
      const {ScoreMobileComponent} = await import('../../components/score-mobile/score-mobile.component');
      scoreFactory = this.cfr.resolveComponentFactory(
        ScoreMobileComponent);
    } else {
      const {ScoreComponent} = await import('../../components/score/score.component');
      scoreFactory = this.cfr.resolveComponentFactory(
        ScoreComponent);
    }
    this.scoreContainer.clear();
    const {instance} = this.scoreContainer.createComponent(
      scoreFactory, null, this.injector);
    return <ScoreComponent>instance;
  }

  ngOnDestroy(): void {
    clearInterval(this.scoreInterval);
    this.completeScores.complete();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = this.window.innerWidth;

    if (this.isMobile != this.innerWidth <= 600) {
      this.ngOnChanges().then();
    }
  }

  get hasScores(): boolean {
    return this.scores && this.scores.length && this.scores.length > 0;
  }
}
