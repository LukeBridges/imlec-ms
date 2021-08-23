import {createAction, props} from '@ngrx/store';
import {ScoreModel} from '../../core/models/score.model';

export const getScores = createAction('[Scores] getScores');
export const getScoresSuccess = createAction('[Scores] getScoresSuccess');
export const updateScores = createAction('[Scores] updateScores');
export const updateScoresSuccess = createAction(
  '[Scores] updateScoresSuccess', props<{ payload: ScoreModel[] }>());
