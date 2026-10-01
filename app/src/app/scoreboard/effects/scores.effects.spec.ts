import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of} from 'rxjs';
import {ScoresEffects} from './scores.effects';
import {ScoresService} from '../services/scores.service';
import * as Actions from '../actions/scores.actions';

describe('ScoresEffects', () => {
  test('should fetch and dispatch update action', async () => {
    const payload: any = [];
    const service = {fetchFromJson: vitest.fn().mockResolvedValue(payload), getScores: vitest.fn().mockReturnValue(payload)};
    TestBed.configureTestingModule({
      providers: [
        ScoresEffects,
        provideMockActions(() => of(Actions.getScores())),
        {provide: ScoresService, useValue: service},
      ],
    });
    const effects = TestBed.inject(ScoresEffects);

    const result = await new Promise(resolve => effects.getScores$.subscribe(resolve));

    expect(service.fetchFromJson).toHaveBeenCalled();
    expect(result).toEqual(Actions.updateScores({payload}));
  });
});
