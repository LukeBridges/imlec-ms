import {ContextService} from './context.service';

describe('ContextService', () => {
  const service = new ContextService({IMLEC: {hash: 'abc'}} as any);

  test('should expose raw context', () => {
    expect(service.rawContext).toEqual({hash: 'abc'});
  });

  test('should expose hash', () => {
    expect(service.hash).toEqual('abc');
  });
});
