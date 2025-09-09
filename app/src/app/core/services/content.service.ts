import {Inject, Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Store} from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {State} from '../models/state.model';
import {Content} from '../models/content.model';
import {initialState} from '../reducers/content.reducer';
import {BaseFetchFromJsonService} from './base-fetch-from-json.service';
import {ContextService} from "./context.service";

@Injectable({providedIn: 'root'})
export class ContentService extends BaseFetchFromJsonService {
  protected url = environment.url + '/api/content/';

  protected list: Content = initialState;

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(Store) store: Store<State>,
    @Inject(ContextService) context: ContextService
  ) {
    super(http, store);
    this.url += context.hash;
  }

  public get content(): Content {
    return this.list;
  }

  public getContent(): Observable<Content> {
    return of(this.list);
  }

  protected initList() {
    this.list = initialState;
  }
}
