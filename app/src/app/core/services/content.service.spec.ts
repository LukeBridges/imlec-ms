import {ContentService} from './Content.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/Content.reducer';
import {BlankContentItem} from '../models/content.model';
import {TestBed} from "@angular/core/testing";
import {ContextService} from "./context.service";
import {ContextServiceMock} from "../../../test/mock/services/context.service.mock";
import {provideHttpClient} from "@angular/common/http";
import {provideHttpClientTesting} from "@angular/common/http/testing";
import {StoreModule} from "@ngrx/store";
import * as fromEntries from "../../listings/reducers/entries.reducer";
import {WINDOW_PROVIDERS} from "./window.service";

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({scores: fromEntries.reducer}),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ContextService, useClass: ContextServiceMock},
        WINDOW_PROVIDERS
      ]
    }).compileComponents();

    service = TestBed.inject(ContentService);
  });

  test('should create', () => {
    expect(ContentService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = TestBed.inject(ContentService);

      expect(localService['list']).toEqual(initialState);
    });
  });

  describe('getContent', () => {
    test('should return observable of Content', () => new Promise(done => {
      const expected = initialState;
      service['list'] = expected;

      service.getContent().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    }));

    test('should return observable of default object', () => new Promise(done => {
      const expected = initialState;
      service['list'] = {welcome: BlankContentItem};

      service.getContent().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    }));
  });
});
