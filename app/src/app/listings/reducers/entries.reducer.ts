import * as EntriesActions from '../actions/entries.actions';
import {Action, createReducer, on} from '@ngrx/store';
import {LocoModel} from '../../core/models/loco.model';

export interface State {
  entries: LocoModel[];
}

export const initialState: State = {
  entries: [],
};

const entriesReducer = createReducer(
  initialState,
  on(EntriesActions.updateEntriesSuccess,
    (state, {payload}) => ({entries: payload})),
);

export function reducer(state: State | undefined, action: Action) {
  return entriesReducer(state, action);
}
