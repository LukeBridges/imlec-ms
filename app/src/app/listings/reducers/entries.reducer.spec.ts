import {initialState, reducer} from './entries.reducer';
import {updateEntries} from '../actions/entries.actions';
import {LocoModel} from '../../core/models/loco.model';

describe('entries reducer', () => {
  test('should return initial state', () => {
    expect(reducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  test('should replace state on updateEntries', () => {
    const payload = [new LocoModel({runNo: 1})];

    expect(reducer(initialState, updateEntries({payload}))).toEqual(payload);
  });
});
