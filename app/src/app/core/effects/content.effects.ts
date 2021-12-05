import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {mergeMap} from 'rxjs/operators';
import * as ContentActions from '../actions/content.actions';
import {ContentService} from '../services/content.service';

@Injectable()
export class ContentEffects {
  getContent$ = createEffect(() => this.actions$.pipe(
    ofType(ContentActions.getContent),
    mergeMap(() => this.contentService.fetchFromJson().then(
      content => ContentActions.updateContent({payload: content}),
    )),
  ));

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(ContentService) private contentService: ContentService,
  ) {
  }
}
