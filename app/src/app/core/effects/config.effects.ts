import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map, mergeMap} from 'rxjs/operators';
import {ConfigService} from '../services/config.service';
import * as ConfigActions from '../actions/config.actions';

@Injectable()
export class ConfigEffects {
  getConfig$ = createEffect(() => this.actions$.pipe(
    ofType(ConfigActions.getConfig),
    map(() => {
      this.configService.fetchFromJson(ConfigActions.updateConfig);
      return ConfigActions.getConfigSuccess();
    }),
  ));
  updateConfig$ = createEffect(() => this.actions$.pipe(
    ofType(ConfigActions.updateConfig),
    mergeMap(() => this.configService.getConfig().pipe(
      map(entries => ConfigActions.updateConfigSuccess({payload: entries})),
    )),
  ));

  constructor(
    @Inject(Actions) private actions$: Actions,
    @Inject(ConfigService) private configService: ConfigService,
  ) {
  }
}
