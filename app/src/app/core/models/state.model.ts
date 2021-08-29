import * as fromRouter from '@ngrx/router-store';
import {RouterStateUrl} from '../reducers';
import {ScoreModel} from './score.model';
import {LocoModel} from './loco.model';

export interface State {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  scores: ScoreModel[],
  entries: LocoModel[],
}
