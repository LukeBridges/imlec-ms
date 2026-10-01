import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
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
import {ScoreboardRoutingModule} from '../../scoreboard-routing.module';
import {EffectsModule} from '@ngrx/effects';
import {ScoresEffects} from '../../effects/scores.effects';
import {EntriesEffects} from '../../../listings/effects/entries.effects';
import * as fromEntries from '../../../listings/reducers/entries.reducer';
import {MatTableModule} from '@angular/material/table';
import {MatExpansionModule} from '@angular/material/expansion';
import {CoreModule} from '../../../core/core.module';
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
        CoreModule,
        ScoreboardRoutingModule,
        StoreModule.forFeature('scores', fromScores.reducer),
        StoreModule.forFeature('entries', fromEntries.reducer),
        EffectsModule.forFeature([ScoresEffects, EntriesEffects]),
        HttpClientTestingModule,
        MatTableModule,
        MatExpansionModule,
      ],
      declarations: [
        BoardComponent,
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
    test('should dispatch update scores', fakeAsync(() => {
      vitest.spyOn(component.store, 'dispatch').mockImplementation();

      component.ngOnInit();

      tick(BoardComponent.SCORE_REFRESH * 1.5);

      expect(component.store.dispatch).
        toHaveBeenCalledWith(ScoresActions.getScores());
      expect(component.store.dispatch).toHaveBeenCalledTimes(2);

      discardPeriodicTasks();
    }));
  });

  describe('hasScores', () => {
    test('should return true then scores loaded', fakeAsync(() => {
      component.scores$ = new Observable<ScoreModel[]>(sub => {
        sub.next(null);
        sub.next([
          new ScoreModel({runNo: 1}),
          new ScoreModel({runNo: 2}),
        ]);
        sub.complete();
      });

      component.ngOnInit();

      tick(100);

      expect(component.hasScores).toBeTruthy();

      discardPeriodicTasks();
    }));

    test('should return false when no scores', fakeAsync(() => {
      component.scores$ = new Observable<ScoreModel[]>();

      component.ngOnInit();

      expect(component.hasScores).toBeFalsy();

      discardPeriodicTasks();
    }));

    test('should return false even if empty scores list', () => {
      component.scores$ = new Observable<ScoreModel[]>(sub => {
        sub.next(null);
        sub.next([]);
        sub.complete();
      });

      component.ngOnInit();

      expect(component.hasScores).toBeFalsy();
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
      expect(changes).toHaveBeenCalledTimes(1);
    });

    test('should be mobile on narrow window', () => {
      component.window = {innerWidth: 400, setInterval: () => 1} as any;

      component.ngOnInit();

      expect(component.isMobile).toBe(true);
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
