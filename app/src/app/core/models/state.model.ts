import * as fromRouter from '@ngrx/router-store';
import {RouterStateUrl} from '../reducers';

export interface State {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  scores: { scores: [] },
  entries: { entries: [] },
}
