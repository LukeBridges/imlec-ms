import {ContentService} from './Content.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/Content.reducer';
import {BlankContentItem} from '../models/content.model';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService(null, null);
  });

  test('should create', () => {
    expect(ContentService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = new ContentService(null, null);

      expect(localService['list']).toEqual(initialState);
    });
  });

  describe('getContent', () => {
    test('should return observable of Content', (done) => {
      const expected = initialState;
      service['list'] = expected;

      service.getContent().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });

    test('should return observable of default object', (done) => {
      const expected = initialState;
      service['list'] = {welcome: BlankContentItem};

      service.getContent().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });
  });
});
