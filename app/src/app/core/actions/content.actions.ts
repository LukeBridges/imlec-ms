import {createAction, props} from '@ngrx/store';
import {Content} from '../models/content.model';

export const getContent = createAction('[Content] getContent');
export const updateContent = createAction('[Content] updateContent', props<{ payload: Content }>());
