import {ConfigService} from './config.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/config.reducer';
import {TestBed} from "@angular/core/testing";
import {ContextService} from "./context.service";
import {ContextServiceMock} from "../../../test/mock/services/context.service.mock";
import {StoreModule} from "@ngrx/store";
import * as fromConfig from "../reducers/config.reducer";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import {WINDOW_PROVIDERS} from "./window.service";

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({scores: fromConfig.reducer}),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ContextService, useClass: ContextServiceMock},
        WINDOW_PROVIDERS,
      ]
    }).compileComponents();

    service = TestBed.inject(ConfigService);
  });

  test('should create', () => {
    expect(ConfigService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = TestBed.inject(ConfigService);

      expect(localService['list']).toEqual(initialState);
    });
  });

  describe('getConfig', () => {
    test('should return observable of config', () => new Promise(done => {
      const expected = initialState;
      service['list'] = expected;

      service.getConfig().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    }));
  });
});
