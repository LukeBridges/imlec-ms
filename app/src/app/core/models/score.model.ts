import {LocoModel} from './loco.model';

export class ScoreModel {
  runNo: number;

  workDone: number;
  runningTime: number;
  coalUsed: number;
  distanceTravelled: number;
  load: number;
  dnf = false;

  loco?: LocoModel;

  score: any;

  expanded = false;

  private readonly COAL_USED_MAGIC = 14000 * 778;

  constructor(config?: any) {
    if (config) {
      this.runNo = config && config.runNo;
      this.workDone = config && config.workDone;
      this.runningTime = config && config.runningTime;
      this.coalUsed = config && config.coalUsed;
      this.distanceTravelled = config && config.distanceTravelled;
      this.load = config && config.load;
      this.loco = config && config.loco;

      this.score = this.workDone && this.coalUsed && this.calculatedScoreToDisplay;
      if (this.workDone == 0) {
        this.score = 'Retired / Did not start';
        this.dnf = true;
      }
    }
  }

  get calculatedScore(): number {
    return (this.workDone * 100) / (this.coalUsed * this.COAL_USED_MAGIC);
  }

  get calculatedScoreToDisplay(): number {
    const score = this.calculatedScore;
    return isNaN(score) ? null : Math.round(score * 10000) / 10000;
  }

  get averageDbHorsepower(): number {
    return this.workDone / (this.runningTime * 33000);
  }

  get averageDbHorsepowerToDisplay(): number {
    const hp = this.averageDbHorsepower;
    return isNaN(hp) ? null : Math.round(hp * 10000) / 10000;
  }

  get coalConsumptionRate(): number {
    return (this.coalUsed * 60) / this.runningTime;
  }

  get specificCoalConsumption(): number {
    return this.coalConsumptionRate / this.averageDbHorsepower;
  }

  get specificCoalConsumptionToDisplay(): number {
    const consumption = this.specificCoalConsumption;
    return isNaN(consumption) ? null : Math.round(consumption * 100) / 100;
  }

  get averageDrawBarPull(): number {
    return this.workDone / this.distanceTravelled;
  }

  static scoreSort(a: ScoreModel, b: ScoreModel) {
    if (a.workDone == 0 || typeof a.score == 'string') {
      a.score = -1;
    }
    if (b.workDone == 0 || typeof b.score == 'string') {
      b.score = 0;
    }
    return b.score - a.score;
  }
}
