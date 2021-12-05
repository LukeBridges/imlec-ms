import {BaseFetchFromJsonService} from './base-fetch-from-json.service';

describe('BaseFetchFromJsonService', () => {
  test('should create', () => {
    expect(BaseFetchFromJsonService).toBeTruthy();
  });

  describe('constructor', () => {
    test('should return service instance and init list', () => {
      const localService = new BaseFetchFromJsonService(null, null);

      expect(localService['list']).toEqual([]);
    });
  });
});
