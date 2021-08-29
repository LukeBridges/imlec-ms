import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EntriesService} from '../services/entries.service';
import * as EntriesActions from '../actions/entries.actions';
import {map, mergeMap} from 'rxjs/operators';

@Injectable()
export class EntriesEffects {
  getEntries$ = createEffect(() => this.actions$.pipe(
    ofType(EntriesActions.getEntries),
    map(() => {
      this.entriesService.fetchFromJson(EntriesActions.updateEntries());
      return EntriesActions.getEntriesSuccess();
    }),
  ));
  updateEntries$ = createEffect(() => this.actions$.pipe(
    ofType(EntriesActions.updateEntries),
    mergeMap(() => this.entriesService.getEntries().pipe(
      map(entries => EntriesActions.updateEntriesSuccess({payload: entries})),
    )),
  ));

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(EntriesService) private entriesService: EntriesService,
  ) {
  }
}
