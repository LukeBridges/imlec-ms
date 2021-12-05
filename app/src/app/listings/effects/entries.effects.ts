import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EntriesService} from '../services/entries.service';
import * as EntriesActions from '../actions/entries.actions';
import {mergeMap} from 'rxjs/operators';

@Injectable()
export class EntriesEffects {
  getEntries$ = createEffect(() => this.actions$.pipe(
    ofType(EntriesActions.getEntries),
    mergeMap(() => this.entriesService.fetchFromJson().then(
      entries => EntriesActions.updateEntries({payload: entries}),
    )),
  ));

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(EntriesService) private entriesService: EntriesService,
  ) {
  }
}
