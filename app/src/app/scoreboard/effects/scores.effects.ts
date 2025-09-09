import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {mergeMap} from 'rxjs/operators';
import {ScoresService} from '../services/scores.service';
import * as ScoresActions from '../actions/scores.actions';

@Injectable()
export class ScoresEffects {
  getScores$ = createEffect(() => this.actions$.pipe(
    ofType(ScoresActions.getScores),
    mergeMap(() => this.scoresService.fetchFromJson().then(
      scores => ScoresActions.updateScores({payload: this.scoresService.getScores()}),
    )),
  ));

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(ScoresService) private scoresService: ScoresService,
  ) {
  }
}
