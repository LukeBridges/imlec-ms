import {State} from '../reducers/config.reducer';
import {State as RootState} from '../../core/models/state.model';

export const selectConfig = (state: RootState): State => state && state.config;
