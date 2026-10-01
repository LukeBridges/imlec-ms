import {State} from '../reducers/content.reducer';
import {State as RootState} from '../../core/models/state.model';

export const selectContent = (state: RootState): State => state && state.content;
