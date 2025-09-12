import {ScoresService} from './scores.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/scores.reducer';
import {TestBed} from "@angular/core/testing";
import {ContextService} from "../../core/services/context.service";
import {WINDOW_PROVIDERS} from "../../core/services/window.service";
import {ContextServiceMock} from "../../../test/mock/services/context.service.mock";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import {StoreModule} from "@ngrx/store";
import * as fromScores from "../../scoreboard/reducers/scores.reducer";

describe('ScoresService', () => {
  let service: ScoresService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({scores: fromScores.reducer}),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ContextService, useClass: ContextServiceMock},
        WINDOW_PROVIDERS,
      ],
    }).compileComponents();

    service = TestBed.inject(ScoresService);
  });

  test('should create', () => {
    expect(ScoresService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = TestBed.inject(ScoresService);

      expect(localService['list']).toEqual(null);
    });
  });

  describe('getConfig', () => {
    test('should return observable of config', (done) => {
      const expected = initialState;
      service['list'] = expected;

      const scores = service.getScores();
      expect(scores).toEqual(expected);
    });

    test('should return observable of blank object', (done) => {
      const expected = initialState;
      service['list'] = null;

      const scores = service.getScores();
      expect(scores).toEqual(expected);
    });
  });
});
