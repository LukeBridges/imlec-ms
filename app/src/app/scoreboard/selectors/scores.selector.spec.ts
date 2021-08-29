import {selectScores} from './scores.selector';

describe('ScoresSelector', () => {
  const state = {scores: {scores: []}};

  it('selectScores', () => {
    expect(selectScores(null)).toEqual(null);
    expect(selectScores(state)).toEqual({scores: []});
  });

  it('getScores', () => {
    expect(selectScores(state.scores)).toEqual([]);
  });
});
