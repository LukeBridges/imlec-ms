import * as fromRouter from '@ngrx/router-store';
import {ScoreModel} from './score.model';
import {LocoModel} from './loco.model';
import {Content} from './content.model';
import {RouterStateUrl} from './routerStateUrl.model';
import {Config} from "../../../../../common/models/config.model";

export interface State {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  scores: ScoreModel[],
  entries: LocoModel[],
  config: Config,
  content: Content
}
