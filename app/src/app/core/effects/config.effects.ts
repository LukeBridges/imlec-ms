import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {mergeMap} from 'rxjs/operators';
import {ConfigService} from '../services/config.service';
import * as ConfigActions from '../actions/config.actions';

@Injectable()
export class ConfigEffects {
  getConfig$ = createEffect(() => this.actions$.pipe(
    ofType(ConfigActions.getConfig),
    mergeMap(() => this.configService.fetchFromJson().then(
      config => ConfigActions.updateConfig({payload: config}),
    )),
  ));

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(ConfigService) private configService: ConfigService,
  ) {
  }
}
