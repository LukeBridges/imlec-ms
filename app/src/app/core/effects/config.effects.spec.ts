import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of} from 'rxjs';
import {ConfigEffects} from './config.effects';
import {ConfigService} from '../services/config.service';
import * as Actions from '../actions/config.actions';

describe('ConfigEffects', () => {
  test('should fetch and dispatch update action', async () => {
    const payload: any = {primaryColour: 'x'};
    const service = {fetchFromJson: vitest.fn().mockResolvedValue(payload)};
    TestBed.configureTestingModule({
      providers: [
        ConfigEffects,
        provideMockActions(() => of(Actions.getConfig())),
        {provide: ConfigService, useValue: service},
      ],
    });
    const effects = TestBed.inject(ConfigEffects);

    const result = await new Promise(resolve => effects.getConfig$.subscribe(resolve));

    expect(service.fetchFromJson).toHaveBeenCalled();
    expect(result).toEqual(Actions.updateConfig({payload}));
  });
});
