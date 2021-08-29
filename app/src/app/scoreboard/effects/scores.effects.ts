import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map, mergeMap} from 'rxjs/operators';
import {ScoresService} from '../services/scores.service';
import * as ScoresActions from '../actions/scores.actions';

@Injectable()
export class ScoresEffects {
  getScores$ = createEffect(() => this.actions$.pipe(
    ofType(ScoresActions.getScores),
    map(() => {
      this.scoresService.fetchFromJson(ScoresActions.updateScores());
      return ScoresActions.getScoresSuccess();
    }),
  ));
  updateScores$ = createEffect(() => this.actions$.pipe(
    ofType(ScoresActions.updateScores),
    mergeMap(() => this.scoresService.getScores().pipe(
      map(scores => ScoresActions.updateScoresSuccess({payload: scores})),
    )),
  ));

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(ScoresService) private scoresService: ScoresService,
  ) {
  }
}
