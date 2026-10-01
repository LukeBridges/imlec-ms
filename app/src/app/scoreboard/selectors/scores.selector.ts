import {State} from '../reducers/scores.reducer';
import {State as RootState} from '../../core/models/state.model';

export const selectScores = (state: RootState): State => state && state.scores;
