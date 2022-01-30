import * as fromRouter from '@ngrx/router-store';
import {ScoreModel} from './score.model';
import {LocoModel} from './loco.model';
import {Config} from './config.model';
import {Content} from './content.model';
import {RouterStateUrl} from './routerStateUrl.model';

export interface State {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  scores: ScoreModel[],
  entries: LocoModel[],
  config: Config,
  content: Content
}
