import {createAction, props} from '@ngrx/store';
import {Config} from "../../../../../common/models/config.model";

export const getConfig = createAction('[Config] getConfig');
export const updateConfig = createAction('[Config] updateConfig', props<{ payload: Config }>());
