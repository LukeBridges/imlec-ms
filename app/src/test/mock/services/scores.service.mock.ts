import {ScoresService} from '../../../app/scoreboard/services/scores.service';
import {Injectable} from '@angular/core';

@Injectable()
export class ScoresServiceMock extends ScoresService {

  private mockScores = [
    [
      0, 0, 0, 77640, 852, 0.95, 7984, 5,
    ],
    [
      1, 0, 0, 24553, 288, 0.25, 2253, 4,
    ],
  ];

  public async fetchFromJson() {
    super.list = <any[]>this.mockScores;
    return Promise.resolve();
  }
}
