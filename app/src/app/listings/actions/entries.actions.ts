import {createAction, props} from '@ngrx/store';
import {LocoModel} from '../../core/models/loco.model';

export const getEntries = createAction('[Entries] getEntries');
export const getEntriesSuccess = createAction('[Entries] getEntriesSuccess');
export const updateEntries = createAction('[Entries] updateEntries');
export const updateEntriesSuccess = createAction(
  '[Entries] updateEntriesSuccess', props<{ payload: LocoModel[] }>());
