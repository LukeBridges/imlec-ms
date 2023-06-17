import {Inject, Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Store} from '@ngrx/store';
import {HttpClient} from '@angular/common/http';
import {BaseFetchFromJsonService} from '../../core/services/base-fetch-from-json.service';
import {environment} from '../../../environments/environment';
import {State} from '../../core/models/state.model';
import {ScoreModel} from '../../core/models/score.model';

@Injectable({providedIn: 'root'})
export class ScoresService extends BaseFetchFromJsonService {
  protected url = environment.url + '/api/scores/';

  protected list: ScoreModel[] = null;

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(Store) store: Store<State>,
  ) {
    super(http, store);
  }

  public getScores(): Observable<ScoreModel[]> {
    if (!this.list) {
      return of([]);
    }

    const scoresList = [];

    this.list.forEach((row: ScoreModel, index: number) => {
      const score = new ScoreModel({
        runNo: row[0],
        workDone: row[3],
        runningTime: row[4],
        coalUsed: row[5],
        distanceTravelled: row[6],
        load: row[7],
      });
      scoresList.push(score);
    });

    scoresList.sort(ScoreModel.scoreSort);

    return of(scoresList);
  }
}
