import {ScoresService} from './scores.service';
import {take} from 'rxjs/operators';
import {initialState} from '../reducers/scores.reducer';

describe('ScoresService', () => {
  let service: ScoresService;

  beforeEach(() => {
    service = new ScoresService(null, null);
  });

  test('should create', () => {
    expect(ScoresService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = new ScoresService(null, null);

      expect(localService['list']).toEqual(null);
    });
  });

  describe('getConfig', () => {
    test('should return observable of config', (done) => {
      const expected = initialState;
      service['list'] = expected;

      service.getScores().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });

    test('should return observable of blank object', (done) => {
      const expected = initialState;
      service['list'] = null;

      service.getScores().pipe(take(1)).subscribe(value => {
        expect(value).toEqual(expected);
        done();
      });
    });
  });
});
