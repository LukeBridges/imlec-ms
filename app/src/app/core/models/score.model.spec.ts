import {ScoreModel} from './score.model';
import {LocoModel} from './loco.model';

describe('ScoreModel', () => {
  const model = new ScoreModel({
    runNo: 1,
    workDone: 150000,
    runningTime: 30,
    coalUsed: 1.5,
    distanceTravelled: 20000,
    load: 8,
    loco: new LocoModel({runNo: 1, name: 'testName'}),
  });

  it('should create', () => {
    expect(ScoreModel).toBeTruthy();
  });

  describe('constructor', () => {
    it('should construct', () => {
      expect(new ScoreModel()).toBeTruthy();
    });

    it('should accept config', () => {
      expect(model.runNo).toEqual(1);
      expect(model.workDone).toEqual(150000);
      expect(model.runningTime).toEqual(30);
      expect(model.coalUsed).toEqual(1.5);
      expect(model.distanceTravelled).toEqual(20000);
      expect(model.load).toEqual(8);
      expect(model.loco.name).toEqual('testName');

      expect(model.score).toEqual(0.9181);
    });

    it('should accept config and set dnf', () => {
      const model = new ScoreModel({
        runNo: 1,
        workDone: 0,
      });

      expect(model.dnf).toBeTruthy();
      expect(typeof model.score).toEqual('string');
    });
  });

  describe('calculatedScore', () => {
    it('should return score', () => {
      expect(model.calculatedScore).toEqual(0.9181050312155711);
    });
  });

  describe('calculatedScoreToDisplay', () => {
    it('should return formatted score', () => {
      expect(model.calculatedScoreToDisplay).toEqual(0.9181);
    });
  });

  describe('averageDbHorsepower', () => {
    it('should return drawbar horsepower', () => {
      expect(model.averageDbHorsepower).toEqual(0.15151515151515152);
    });
  });

  describe('averageDbHorsepowerToDisplay', () => {
    it('should return formatted drawbar horsepower', () => {
      expect(model.averageDbHorsepowerToDisplay).toEqual(0.1515);
    });
  });

  describe('specificCoalConsumption', () => {
    it('should return coal consumption', () => {
      expect(model.specificCoalConsumption).toEqual(19.8);
    });
  });

  describe('specificCoalConsumptionToDisplay', () => {
    it('should return formatted coal consumption', () => {
      expect(model.specificCoalConsumptionToDisplay).toEqual(19.8);
    });
  });

  describe('averageDrawBarPull', () => {
    it('should return average drawbar pull', () => {
      expect(model.averageDrawBarPull).toEqual(7.5);
    });
  });

  describe('scoreSort', () => {
    let scoreA: ScoreModel;
    let scoreB: ScoreModel;

    beforeEach(() => {
      scoreA = new ScoreModel({
        runNo: 1,
        workDone: 0,
        coalUsed: 0,
      });
      scoreB = new ScoreModel({
        runNo: 2,
        workDone: 0,
        coalUsed: 0,
      });
    });

    it('should return -1 if score a is dnf', () => {
      scoreB = new ScoreModel({
        runNo: 1,
        workDone: 10000,
        coalUsed: 1.5,
      });
      expect(ScoreModel.scoreSort(scoreA, scoreB)).toEqual(1.0612);
    });

    it('should return 0 if score b is dnf', () => {
      scoreA = new ScoreModel({
        runNo: 1,
        workDone: 10000,
        coalUsed: 1.5,
      });
      expect(ScoreModel.scoreSort(scoreA, scoreB)).toEqual(-0.0612);
    });
  });
});
