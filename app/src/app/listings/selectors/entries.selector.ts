import {State} from '../reducers/entries.reducer';

export const selectEntries = (state): State => state && state.entries;
