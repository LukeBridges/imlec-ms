import {LocoModel} from './loco.model';

describe('LocoModel', () => {
  it('should create', () => {
    expect(LocoModel).toBeTruthy();
  });

  it('should construct a new LocoModel', () => {
    expect(new LocoModel()).toBeTruthy();
    expect(new LocoModel({})).toBeTruthy();
    expect(new LocoModel({
      runNo: 1,
      name: 'test',
      model: 'test',
      builder: 'test',
      gauge: 'test',
      arrangement: '0-6-0',
      driver: 'test',
      img: '',
      time: '',
    })).toBeTruthy();
  });
});
