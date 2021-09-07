import {State} from '../reducers/config.reducer';

export const selectConfig = (state): State => state && state.config;
