import {createAction, props} from '@ngrx/store';
import {Config} from '../models/config.model';

export const getConfig = createAction('[Config] getConfig');
export const getConfigSuccess = createAction('[Config] getConfigSuccess');
export const updateConfig = createAction('[Config] updateConfig');
export const updateConfigSuccess = createAction('[Config] updateConfigSuccess',
  props<{ payload: Config }>());
