import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Router} from '@angular/router';
import {exhaustMap, mergeMap} from 'rxjs/operators';
import {from} from 'rxjs';
import {Go} from '../actions/router.actions';

@Injectable()
export class RouterEffects {

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(Router) private router: Router) {
  }

  go$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(Go),
      exhaustMap(({path, extras, onCompletion}) => {
        const actions = onCompletion ? [...onCompletion] : [];
        return from(this.router.navigate(path,
          {skipLocationChange: true, ...extras})).pipe(
          mergeMap(result => result ? actions : []),
        );
      }),
    );
  });
}
