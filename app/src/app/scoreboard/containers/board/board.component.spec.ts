import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Store, StoreModule} from '@ngrx/store';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {BoardComponent} from './board.component';
import * as fromScores from '../../reducers/scores.reducer';
import * as ScoresActions from '../../actions/scores.actions';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ScoreModel} from '../../../core/models/score.model';
import {Observable, of} from 'rxjs';
import * as EntriesActions from '../../../listings/actions/entries.actions';
import {LocoModel} from '../../../core/models/loco.model';
import {EffectsModule} from '@ngrx/effects';
import {ScoresEffects} from '../../effects/scores.effects';
import {EntriesEffects} from '../../../listings/effects/entries.effects';
import * as fromEntries from '../../../listings/reducers/entries.reducer';
import {State} from '../../../core/models/state.model';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
import {ScoresService} from '../../services/scores.service';
import {ScoresServiceMock} from '../../../../test/mock/services/scores.service.mock';
import {AppModule} from '../../../app.module';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let store: Store<State>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        BoardComponent,
        StoreModule.forFeature('scores', fromScores.reducer),
        StoreModule.forFeature('entries', fromEntries.reducer),
        EffectsModule.forFeature([ScoresEffects, EntriesEffects]),
        HttpClientTestingModule,
      ],
      providers: [
        WINDOW_PROVIDERS,
        {provide: ScoresService, useClass: ScoresServiceMock},
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });
    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.debugElement.componentInstance;
    component.ngOnChanges = () => Promise.resolve();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    test('should dispatch update scores', () => {
      vitest.useFakeTimers();
      vitest.spyOn(component.store, 'dispatch').mockImplementation();

      component.ngOnInit();

      vitest.advanceTimersByTime(BoardComponent.SCORE_REFRESH * 1.5);

      expect(component.store.dispatch).
        toHaveBeenCalledWith(ScoresActions.getScores());
      expect(component.store.dispatch).toHaveBeenCalledTimes(2);

      clearInterval((component as any).scoreInterval);
      vitest.useRealTimers();
    });
  });

  describe('hasScores', () => {
    test('should return true once entries are loaded, even with no scores yet', () => {
      component.entries$ = of([new LocoModel({runNo: 1}), new LocoModel({runNo: 2})]);
      component.scores$ = new Observable<ScoreModel[]>();

      component.ngOnInit();

      expect(component.hasScores).toBeTruthy();
      expect(component.scores.length).toEqual(2);

      clearInterval((component as any).scoreInterval);
    });

    test('should return false when no entries', () => {
      component.entries$ = of(null as any);
      component.scores$ = new Observable<ScoreModel[]>();

      component.ngOnInit();

      expect(component.hasScores).toBeFalsy();

      clearInterval((component as any).scoreInterval);
    });

    test('should return false when entries list is empty', () => {
      component.entries$ = of([]);
      component.scores$ = new Observable<ScoreModel[]>();

      component.ngOnInit();

      expect(component.hasScores).toBeFalsy();

      clearInterval((component as any).scoreInterval);
    });
  });

  describe('ngOnInit entries', () => {
    test('should request entries when none', () => {
      vitest.spyOn(component.store, 'dispatch').mockImplementation();
      component.entries$ = of([]);

      component.ngOnInit();
      clearInterval((component as any).scoreInterval);

      expect(component.store.dispatch).toHaveBeenCalledWith(EntriesActions.getEntries());
    });

    test('should request entries when null', () => {
      vitest.spyOn(component.store, 'dispatch').mockImplementation();
      component.entries$ = of(null as any);

      component.ngOnInit();
      clearInterval((component as any).scoreInterval);

      expect(component.store.dispatch).toHaveBeenCalledWith(EntriesActions.getEntries());
    });

    test('should request scores when entries loaded', () => {
      vitest.spyOn(component.store, 'dispatch').mockImplementation();
      const entries = [new LocoModel({runNo: 1})];
      component.entries$ = of(entries);

      component.ngOnInit();
      clearInterval((component as any).scoreInterval);

      expect(component.entries).toEqual(entries);
      expect(component.store.dispatch).toHaveBeenCalledWith(ScoresActions.getScores());
    });

    test('should match scores to entries and ignore repeated scores', () => {
      vitest.spyOn(component.store, 'dispatch').mockImplementation();
      const changes = vitest.fn();
      component.ngOnChanges = changes;
      const entries = [new LocoModel({runNo: 1, name: 'one'})];
      const scores = [new ScoreModel({runNo: 1, workDone: 10, coalUsed: 1})];
      component.entries$ = of(entries);
      component.scores$ = of(scores, scores);

      component.ngOnInit();
      clearInterval((component as any).scoreInterval);

      expect(component.scores.length).toEqual(1);
      expect(component.scores[0].loco?.name).toEqual('one');
      // once when the entries alone arrive (placeholder board), once when the real score lands
      expect(changes).toHaveBeenCalledTimes(2);
    });

    test('should be mobile on narrow window', () => {
      component.window = {innerWidth: 400, setInterval: () => 1} as any;

      component.ngOnInit();

      expect(component.isMobile).toBe(true);
    });
  });

  describe('rebuildBoard', () => {
    test('should show every entry in run order as a placeholder before any score arrives', () => {
      component.ngOnChanges = vitest.fn().mockResolvedValue(undefined);
      // entries deliberately out of run order, to prove the merge sorts them rather than just passing them through
      component.entries = [new LocoModel({runNo: 2}), new LocoModel({runNo: 1})];

      component.rebuildBoard();

      expect(component.scores.map(s => s.runNo)).toEqual([1, 2]);
      expect(component.scores.every(s => s.score === undefined)).toBeTruthy();
      expect(component.ngOnChanges).toHaveBeenCalled();
    });

    test('should use the recorded score for an entry once it has one, keeping others as placeholders', () => {
      component.ngOnChanges = vitest.fn().mockResolvedValue(undefined);
      component.entries = [new LocoModel({runNo: 1}), new LocoModel({runNo: 2})];
      component['recordedScores'] = [new ScoreModel({runNo: 2, workDone: 10000, coalUsed: 1.5})];

      component.rebuildBoard();

      const [first, second] = component.scores;
      expect(first.runNo).toEqual(2);
      expect(typeof first.score).toEqual('number');
      expect(second.runNo).toEqual(1);
      expect(second.score).toBeUndefined();
    });
  });

  describe('ngOnChanges', () => {
    let instance: any;

    beforeEach(() => {
      delete (component as any).ngOnChanges;
      instance = {
        desktop: true,
        ngOnInit: vitest.fn(),
        changeDetection: {detectChanges: vitest.fn()},
        captureRowRects: vitest.fn().mockReturnValue(new Map()),
        playFlap: vitest.fn(),
      };
      vitest.spyOn(component, 'getScoreComponent').mockResolvedValue(instance);
      component.innerWidth = 1000;
    });

    test('should create score component when none', async () => {
      await component.ngOnChanges();

      expect(component.getScoreComponent).toHaveBeenCalled();
      expect(instance.ngOnInit).toHaveBeenCalled();
      expect(instance.changeDetection.detectChanges).not.toHaveBeenCalled();
    });

    test('should push scores to existing component', async () => {
      await component.ngOnChanges();
      component.scores = [new ScoreModel({runNo: 1})];

      await component.ngOnChanges();

      expect(component.getScoreComponent).toHaveBeenCalledTimes(1);
      expect(instance.changeDetection.detectChanges).toHaveBeenCalled();
    });

    test('should capture and replay row positions when pushing scores', async () => {
      await component.ngOnChanges();
      component.scores = [new ScoreModel({runNo: 1})];
      const prevRects = new Map([[1, {} as DOMRect]]);
      instance.captureRowRects.mockReturnValue(prevRects);

      await component.ngOnChanges();

      expect(instance.captureRowRects).toHaveBeenCalled();
      expect(instance.playFlap).toHaveBeenCalledWith(prevRects);
    });

    test('should recreate component when switching to mobile', async () => {
      await component.ngOnChanges();
      component.innerWidth = 400;

      await component.ngOnChanges();

      expect(component.isMobile).toBe(true);
      expect(component.getScoreComponent).toHaveBeenCalledTimes(2);
    });
  });

  describe('getScoreComponent', () => {
    let container: any;

    beforeEach(() => {
      component.scores = [new ScoreModel({runNo: 1})];
      fixture.detectChanges();
      container = component.scoreContainer;
      vitest.spyOn(container, 'clear');
      vitest.spyOn(container, 'createComponent').mockReturnValue({instance: {id: 'instance'}} as any);
    });

    test('should create desktop component', async () => {
      component.isMobile = false;

      const result = await component.getScoreComponent();

      expect(container.clear).toHaveBeenCalled();
      expect((container.createComponent as any).mock.calls[0][0].name).toEqual('ScoreComponent');
      expect(result).toEqual({id: 'instance'} as any);
    });

    test('should create mobile component', async () => {
      component.isMobile = true;

      await component.getScoreComponent();

      expect(container.createComponent.mock.calls[0][0].name).toEqual('ScoreMobileComponent');
    });
  });

  describe('onResize', () => {
    beforeEach(() => {
      component.ngOnChanges = vitest.fn().mockResolvedValue(undefined);
      component.window = {innerWidth: 1000} as any;
    });

    test('should re-render when breakpoint changes', () => {
      component.isMobile = true;

      component.onResize();

      expect(component.innerWidth).toEqual(1000);
      expect(component.ngOnChanges).toHaveBeenCalled();
    });

    test('should not re-render when breakpoint unchanged', () => {
      component.isMobile = false;

      component.onResize();

      expect(component.ngOnChanges).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    test('should clean up', () => {
      const spy = vitest.fn();
      component['ngUnsubscribe$'].subscribe({complete: spy});

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });
  });
});
