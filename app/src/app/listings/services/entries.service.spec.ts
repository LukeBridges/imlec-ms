import {EntriesService} from './entries.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/entries.reducer';
import {TestBed} from "@angular/core/testing";
import {provideHttpClient} from "@angular/common/http";
import {ContextService} from "../../core/services/context.service";
import {ContextServiceMock} from "../../../test/mock/services/context.service.mock";
import {WINDOW_PROVIDERS} from "../../core/services/window.service";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import {StoreModule} from "@ngrx/store";
import * as fromEntries from "../reducers/entries.reducer";

describe('EntriesService', () => {
  let service: EntriesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({scores: fromEntries.reducer}),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ContextService, useClass: ContextServiceMock},
        WINDOW_PROVIDERS,
      ],
    }).compileComponents();

    service = TestBed.inject(EntriesService);
  });

  test('should create', () => {
    expect(EntriesService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = TestBed.inject(EntriesService);

      expect(localService['list']).toEqual([]);
    });
  });

  describe('getConfig', () => {
    test('should return observable of config', () => {
      const expected = initialState;
      service['list'] = expected;

      const scores = service.getEntries();
      expect(scores).toEqual(expected);
    });

    test('should return observable of blank object', () => {
      const expected = initialState;
      service['list'] = null;

      const scores = service.getEntries();
      expect(scores).toEqual(expected);
    });
  });

  describe('getEntries with rows', () => {
    test('should map rows to loco models', () => {
      service['list'] = [
        [1, 'Builder', 'Driver', 'Club', 'Model', '0-4-0', '5', 'img.jpg', '900'],
      ];

      const entries = service.getEntries();

      expect(entries.length).toEqual(1);
      expect(entries[0].runNo).toEqual(1);
      expect(entries[0].builder).toEqual('Builder');
      expect(entries[0].driver).toEqual({name: 'Driver', club: 'Club'});
      expect(entries[0].model).toEqual('Model');
      expect(entries[0].arrangement).toEqual('0-4-0');
      expect(entries[0].gauge).toEqual('5');
      expect(entries[0].img).toEqual('img.jpg');
      expect(entries[0].time).toEqual('900');
    });
  });
});
