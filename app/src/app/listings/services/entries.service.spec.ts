import {EntriesService} from './entries.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/entries.reducer';

describe('EntriesService', () => {
  let service: EntriesService;

  beforeEach(() => {
    service = new EntriesService(null, null);
  });

  test('should create', () => {
    expect(EntriesService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = new EntriesService(null, null);

      expect(localService['list']).toEqual([]);
    });
  });

  describe('getConfig', () => {
    test('should return observable of config', (done) => {
      const expected = initialState;
      service['list'] = expected;

      service.getEntries().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });

    test('should return observable of blank object', (done) => {
      const expected = initialState;
      service['list'] = null;

      service.getEntries().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });
  });
});
