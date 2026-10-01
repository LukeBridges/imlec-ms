import {initialState, reducer} from './content.reducer';
import {updateContent} from '../actions/content.actions';

describe('content reducer', () => {
  test('should return initial state', () => {
    expect(reducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  test('should replace state on updateContent', () => {
    const payload = {welcome: {body: 'hello'}};

    expect(reducer(initialState, updateContent({payload}))).toEqual(payload);
  });
});
