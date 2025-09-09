import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Router} from '@angular/router';
import {exhaustMap, mergeMap} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';
import {Go} from '../actions/router.actions';

@Injectable()
export class RouterEffects {

  constructor(
    private actions$: Actions,
    private router: Router) {
  }

  go$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(Go),
      exhaustMap(({path, extras, onCompletion}) => {
        let actions = onCompletion ? [...onCompletion] : [];
        const newRouteName = path[0];
        const prevRouteName = this.router.url;
        // Check the route is not top level and that the old and new event
        // are not the same to avoid excessive events for internal page changes
        // like changing payment method
        if (this.router.url !== '/' && this.router.url !== '/bootstrap' &&
          newRouteName !== prevRouteName) {
          actions = onCompletion ? [...onCompletion] : [];
        }
        return fromPromise(this.router.navigate(path,
          {skipLocationChange: true, ...extras})).pipe(
          mergeMap(result => result ? actions : []),
        );
      }),
    );
  });
}
