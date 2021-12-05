import * as EntriesActions from '../actions/entries.actions';
import {Action, createReducer, on} from '@ngrx/store';
import {LocoModel} from '../../core/models/loco.model';

export type State = LocoModel[];

export const initialState: State = [];

const entriesReducer = createReducer(
  initialState,
  on(EntriesActions.updateEntries,
    (state, {payload}) => (payload)),
);

export function reducer(state: State | undefined, action: Action) {
  return entriesReducer(state, action);
}
