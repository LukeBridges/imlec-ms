import * as ScoreActions from '../actions/scores.actions';
import {ScoreModel} from '../../core/models/score.model';
import {Action, createReducer, on} from '@ngrx/store';

export type State = ScoreModel[];

export const initialState: State = [];

const scoreReducer = createReducer(
  initialState,
  on(ScoreActions.updateScores,
    (state, {payload}) => (payload)),
);

export function reducer(state: State | undefined, action: Action) {
  return scoreReducer(state, action);
}
