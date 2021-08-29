import {State} from '../reducers/scores.reducer';

export const selectScores = (state): State => state && state.scores;
