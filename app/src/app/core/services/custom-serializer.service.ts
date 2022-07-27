import {RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import * as fromRouter from '@ngrx/router-store';
import {RouterStateUrl} from '../models/routerStateUrl.model';

@Injectable({providedIn: 'root'})
export class CustomRouterStateSerializer
  implements fromRouter.RouterStateSerializer<RouterStateUrl> {
  /* istanbul ignore next */
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
