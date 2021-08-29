import {createSelector} from '@ngrx/store';
import {State} from '../reducers/entries.reducer';

export const selectEntries = (state): State => state && state.entries;

export const getEntries = createSelector(selectEntries, (state: State) => state && state.entries);
