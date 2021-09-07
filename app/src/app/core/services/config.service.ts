import {Inject, Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Store} from '@ngrx/store';
import {HttpClient} from '@angular/common/http';
import {BaseFetchFromJsonService} from './base-fetch-from-json.service';
import {environment} from '../../../environments/environment';
import {State} from '../models/state.model';
import {Config} from '../models/config.model';
import {initialState} from '../reducers/config.reducer';

@Injectable()
export class ConfigService extends BaseFetchFromJsonService {
  protected url = environment.url + '/config.json';

  protected list: Config = initialState;

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(Store) store: Store<State>,
  ) {
    super(http, store);
  }

  public get config(): Config {
    return this.list;
  }

  public getConfig(): Observable<Config> {
    return of(this.list ?? initialState);
  }

  protected initList() {
    this.list = initialState;
  }
}
