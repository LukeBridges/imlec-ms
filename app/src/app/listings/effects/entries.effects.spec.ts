import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of} from 'rxjs';
import {EntriesEffects} from './entries.effects';
import {EntriesService} from '../services/entries.service';
import * as Actions from '../actions/entries.actions';

describe('EntriesEffects', () => {
  test('should fetch and dispatch update action', async () => {
    const payload: any = [];
    const service = {fetchFromJson: vitest.fn().mockResolvedValue(payload), getEntries: vitest.fn().mockReturnValue(payload)};
    TestBed.configureTestingModule({
      providers: [
        EntriesEffects,
        provideMockActions(() => of(Actions.getEntries())),
        {provide: EntriesService, useValue: service},
      ],
    });
    const effects = TestBed.inject(EntriesEffects);

    const result = await new Promise(resolve => effects.getEntries$.subscribe(resolve));

    expect(service.fetchFromJson).toHaveBeenCalled();
    expect(result).toEqual(Actions.updateEntries({payload}));
  });
});
