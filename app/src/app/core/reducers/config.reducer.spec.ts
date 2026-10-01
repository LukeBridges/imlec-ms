import {initialState, reducer} from './config.reducer';
import {updateConfig} from '../actions/config.actions';

describe('config reducer', () => {
  test('should return initial state', () => {
    expect(reducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  test('should replace state on updateConfig', () => {
    const payload = {...initialState, primaryColour: '#fff'};

    expect(reducer(initialState, updateConfig({payload}))).toEqual(payload);
  });
});
