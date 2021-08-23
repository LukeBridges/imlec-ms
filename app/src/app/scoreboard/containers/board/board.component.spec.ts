import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {StoreModule} from '@ngrx/store';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {BoardComponent} from './board.component';
import * as fromScores from '../../reducers/scores.reducer';
import * as ScoresActions from '../../actions/scores.actions';
import {HttpClientModule} from '@angular/common/http';
import {ScoreModel} from '../../../core/models/score.model';
import {Observable} from 'rxjs';
import {CommonModule} from '@angular/common';
import {ScoreboardRoutingModule} from '../../scoreboard-routing.module';
import {EffectsModule} from '@ngrx/effects';
import {ScoresEffects} from '../../effects/scores.effects';
import {EntriesEffects} from '../../../listings/effects/entries.effects';
import * as fromEntries from '../../../listings/reducers/entries.reducer';
import {MatTableModule} from '@angular/material/table';
import {MatExpansionModule} from '@angular/material/expansion';
import {CoreModule} from '../../../core/core.module';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  setupTestBed({
    imports: [
      CommonModule,
      CoreModule,
      ScoreboardRoutingModule,
      EffectsModule.forFeature([ScoresEffects, EntriesEffects]),
      StoreModule.forFeature('scores', fromScores.reducer),
      StoreModule.forFeature('entries', fromEntries.reducer),
      HttpClientModule,
      MatTableModule,
      MatExpansionModule,
    ],
    declarations: [
      BoardComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.debugElement.componentInstance;
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    test('should dispatch update scores', fakeAsync(() => {
      jest.spyOn(component.store, 'dispatch');

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
});
