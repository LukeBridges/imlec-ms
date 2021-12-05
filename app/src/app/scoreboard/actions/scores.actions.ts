import {createAction, props} from '@ngrx/store';
import {ScoreModel} from '../../core/models/score.model';

export const getScores = createAction('[Scores] getScores');
export const updateScores = createAction('[Scores] updateScores',
  props<{ payload: ScoreModel[] }>());
