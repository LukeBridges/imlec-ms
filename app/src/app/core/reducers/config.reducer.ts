import * as ConfigActions from '../actions/config.actions';
import {Action, createReducer, on} from '@ngrx/store';
import {Config} from '../models/config.model';

export type State = Config;

export const initialState: State = {};

const configReducer = createReducer(
  initialState,
  on(ConfigActions.updateConfigSuccess,
    (state, {payload}) => (payload)),
);

export function reducer(state: State | undefined, action: Action) {
  return configReducer(state, action);
}
