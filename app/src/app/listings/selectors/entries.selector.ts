import {State} from '../reducers/entries.reducer';
import {State as RootState} from '../../core/models/state.model';

export const selectEntries = (state: RootState): State => state && state.entries;
