import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {of} from 'rxjs';
import {ContentEffects} from './content.effects';
import {ContentService} from '../services/content.service';
import * as Actions from '../actions/content.actions';

describe('ContentEffects', () => {
  test('should fetch and dispatch update action', async () => {
    const payload: any = {welcome: {}};
    const service = {fetchFromJson: vitest.fn().mockResolvedValue(payload)};
    TestBed.configureTestingModule({
      providers: [
        ContentEffects,
        provideMockActions(() => of(Actions.getContent())),
        {provide: ContentService, useValue: service},
      ],
    });
    const effects = TestBed.inject(ContentEffects);

    const result = await new Promise(resolve => effects.getContent$.subscribe(resolve));

    expect(service.fetchFromJson).toHaveBeenCalled();
    expect(result).toEqual(Actions.updateContent({payload}));
  });
});
