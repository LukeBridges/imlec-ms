import {ConfigService} from './config.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/config.reducer';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    service = new ConfigService(null, null);
  });

  test('should create', () => {
    expect(ConfigService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = new ConfigService(null, null);

      expect(localService['list']).toEqual(initialState);
    });
  });

  describe('getConfig', () => {
    test('should return observable of config', (done) => {
      const expected = initialState;
      service['list'] = expected;

      service.getConfig().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });

    test('should return observable of blank object', (done) => {
      const expected = initialState;
      service['list'] = null;

      service.getConfig().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });
  });
});
