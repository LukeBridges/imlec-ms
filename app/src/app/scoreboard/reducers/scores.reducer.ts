import * as ScoreActions from '../actions/scores.actions';
import {ScoreModel} from '../../core/models/score.model';
import {Action, createReducer, on} from '@ngrx/store';

export interface State {
  scores: ScoreModel[];
}

export const initialState: State = {
  scores: [],
};

const scoreReducer = createReducer(
  initialState,
  on(ScoreActions.updateScoresSuccess,
    (state, {payload}) => ({scores: payload})),
);

export function reducer(state: State | undefined, action: Action) {
  return scoreReducer(state, action);
}
