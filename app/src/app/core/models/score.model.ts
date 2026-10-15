import {LocoModel} from './loco.model';

export class ScoreModel {
  runNo: number = -1;

  workDone: number = -1;
  runningTime: number = -1;
  coalUsed: number = -1;
  distanceTravelled: number = -1;
  load: number = -1;
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

  get calculatedScoreToDisplay(): number|null {
    const score = this.calculatedScore;
    return isFinite(score) ? Math.round(score * 10000) / 10000 : null;
  }

  get averageDbHorsepower(): number {
    return this.workDone / (this.runningTime * 33000);
  }

  get averageDbHorsepowerToDisplay(): number|null {
    const hp = this.averageDbHorsepower;
    return isFinite(hp) ? Math.round(hp * 10000) / 10000 : null;
  }

  get coalConsumptionRate(): number {
    return (this.coalUsed * 60) / this.runningTime;
  }

  get specificCoalConsumption(): number {
    return this.coalConsumptionRate / this.averageDbHorsepower;
  }

  get specificCoalConsumptionToDisplay(): number|null {
    const consumption = this.specificCoalConsumption;
    return isFinite(consumption) ? Math.round(consumption * 100) / 100 : null;
  }

  get averageDrawBarPull(): number {
    return this.workDone / this.distanceTravelled;
  }

  get averageDrawBarPullToDisplay(): number|null {
    const pull = this.averageDrawBarPull;
    return isFinite(pull) ? Math.round(pull * 10000) / 10000 : null;
  }

  static scoreSort(a: ScoreModel, b: ScoreModel): number {
    const scoredA = typeof a.score === 'number';
    const scoredB = typeof b.score === 'number';
    if (scoredA && scoredB) return b.score - a.score;
    if (scoredA !== scoredB) return scoredA ? -1 : 1;
    return a.runNo - b.runNo;
  }
}
