import {createSelector} from '@ngrx/store';
import {LocoModel} from '../../core/models/loco.model';

export const selectEntries = (state: { entries: { entries: Array<LocoModel> } }) => {
  return state && state.entries && state.entries.entries;
};

export const getEntries = createSelector(selectEntries,
  state => state);

export const getEntryByRunNo = (runNo: number) => createSelector(selectEntries,
  state => {
    return state && state.find && state.find(entry => entry.runNo === runNo);
  });
