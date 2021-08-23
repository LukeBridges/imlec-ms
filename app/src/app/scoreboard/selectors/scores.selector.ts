import {createSelector} from '@ngrx/store';
import {State} from '../reducers/scores.reducer';

export const selectScores = (state) => state.scores;

export const getScores = createSelector(selectScores,
  (state: State) => state.scores);
