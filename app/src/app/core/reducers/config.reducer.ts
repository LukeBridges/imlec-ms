import * as ConfigActions from '../actions/config.actions';
import {Action, createReducer, on} from '@ngrx/store';
import {Config} from "../../../../../common/models/config.model";

export type State = Config;

export const initialState: State = {
  primaryColour: null,
  features: {
    applicationForm: false,
    scoreboard: false,
    listings: false,
    fullListings: false,
    rules: false,
  },
  data: {
      entries: "",
      scores: ""
  },
};

const configReducer = createReducer(
  initialState,
  on(ConfigActions.updateConfig,
    (state, {payload}) => (payload)),
);

export function reducer(state: State | undefined, action: Action) {
  return configReducer(state, action);
}
