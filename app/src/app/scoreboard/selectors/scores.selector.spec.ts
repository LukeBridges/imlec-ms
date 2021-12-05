import {selectScores} from './scores.selector';

describe('ScoresSelector', () => {
  const state = {scores: {scores: []}};

  test('selectScores', () => {
    expect(selectScores(null)).toEqual(null);
    expect(selectScores(state)).toEqual({scores: []});
  });

  test('getScores', () => {
    expect(selectScores(state.scores)).toEqual([]);
  });
});
