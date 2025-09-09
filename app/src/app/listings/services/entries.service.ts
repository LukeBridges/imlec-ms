import {Inject, Injectable} from '@angular/core';
import {LocoModel} from '../../core/models/loco.model';
import {Store} from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import {BaseFetchFromJsonService} from '../../core/services/base-fetch-from-json.service';
import {environment} from '../../../environments/environment';
import {State} from '../../core/models/state.model';
import {ContextService} from "../../core/services/context.service";

@Injectable({providedIn: 'root'})
export class EntriesService extends BaseFetchFromJsonService {
  protected url = environment.url + '/api/entries/';

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(Store) store: Store<State>,
    @Inject(ContextService) context: ContextService
  ) {
    super(http, store);
    this.url += context.hash;
  }

  public getEntries(): LocoModel[] {
    if (!this.list) {
      return [];
    }

    const entriesList = [];

    this.list.forEach((row: LocoModel, index: number) => {
      const score = new LocoModel({
        runNo: row[0],
        name: row[2],
        model: row[4],
        builder: row[1],
        gauge: row[6],
        arrangement: row[5],
        driver: {
          name: row[2],
          club: row[3],
        },
        img: row[7],
        time: row[8],
      });
      entriesList.push(score);
    });

    return entriesList;
  }
}
