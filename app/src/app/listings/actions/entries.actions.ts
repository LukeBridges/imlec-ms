import {createAction, props} from '@ngrx/store';
import {LocoModel} from '../../core/models/loco.model';

export const getEntries = createAction('[Entries] getEntries');
export const updateEntries = createAction(
  '[Entries] updateEntries', props<{ payload: LocoModel[] }>());
