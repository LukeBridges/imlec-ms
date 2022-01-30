import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import * as fromScores from '../../scoreboard/reducers/scores.reducer';
import * as fromEntries from '../../listings/reducers/entries.reducer';
import * as fromConfig from '../reducers/config.reducer';
import * as fromContent from '../reducers/content.reducer';
import {State} from '../models/state.model';

export const reducers: ActionReducerMap<State> = {
  router: fromRouter.routerReducer,
  scores: fromScores.reducer,
  entries: fromEntries.reducer,
  config: fromConfig.reducer,
  content: fromContent.reducer
};

export const metaReducers: MetaReducer<State>[] = [];
