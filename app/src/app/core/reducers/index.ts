import {ActionReducerMap, MetaReducer} from '@ngrx/store';
import {Params, RouterStateSnapshot} from '@angular/router';
import * as fromRouter from '@ngrx/router-store';
import * as fromScores from '../../scoreboard/reducers/scores.reducer';
import * as fromEntries from '../../listings/reducers/entries.reducer';
import {Injectable} from '@angular/core';
import {State} from '../models/state.model';

export interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

@Injectable()
export class CustomRouterStateSerializer
  implements fromRouter.RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    let route = routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const {url, root: {queryParams}} = routerState;
    const {params} = route;

    // Only return an object including the URL, params and query params
    // instead of the entire snapshot
    return {url, params, queryParams};
  }
}

export const reducers: ActionReducerMap<State> = {
  router: fromRouter.routerReducer,
  scores: fromScores.reducer,
  entries: fromEntries.reducer,
};

export const metaReducers: MetaReducer<State>[] = [];
