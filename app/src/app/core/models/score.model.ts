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

  constructor(config?: any) {
    if (config) {
      this.runNo = config && config.runNo;
      this.workDone = config && config.workDone;
      this.runningTime = config && config.runningTime;
      this.coalUsed = config && config.coalUsed;
      this.distanceTravelled = config && config.distanceTravelled;
      this.load = config && config.load;
      this.loco = config && config.loco;

      this.score = this.workDone && this.coalUsed && this.calculatedScore;
      if (this.workDone == 0) {
        this.score = 'Retired / Did not start';
      }
    }
  }

  get calculatedScore(): number {
    return Math.round(
      ((this.workDone * 100) / (this.coalUsed * 14000 * 778)) * 10000) / 10000;
  }

  get averageDbHorsepower(): number {
    return this.workDone / (this.runningTime * 33000);
  }

  get averageDbHorsepowerToDisplay(): number {
    if (isNaN(this.averageDbHorsepower)) {
      return null;
    }
    return Math.round(this.averageDbHorsepower * 10000) / 10000;
  }

  get coalConsumptionRate(): number {
    return (this.coalUsed * 60) / this.runningTime;
  }

  get specificCoalConsumption(): number {
    return this.coalConsumptionRate / this.averageDbHorsepower;
  }

  get specificCoalConsumptionToDisplay(): number {
    if (isNaN(this.specificCoalConsumption)) {
      return null;
    }
    return Math.round(this.specificCoalConsumption * 100) / 100;
  }

  get averageDrawBarPull(): number {
    return this.workDone / this.distanceTravelled;
  }

  static scoreSort(a, b) {
    if (a.workDone == 0 || typeof a.score == 'string') {
      a.score = -1;
    }
    if (b.workDone == 0 || typeof b.score == 'string') {
      b.score = 0;
    }
    return b.score - a.score;
  }
}
