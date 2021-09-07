import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {throwError} from 'rxjs';
import {Action, Store} from '@ngrx/store';
import {catchError} from 'rxjs/operators';
import {Inject, Injectable} from '@angular/core';
import {State} from '../models/state.model';

@Injectable()
export class BaseFetchFromJsonService {
  protected url = null;

  protected list: any;

  constructor(
    @Inject(HttpClient) protected http: HttpClient,
    @Inject(Store) protected store: Store<State>,
  ) {
    this.initList();
  }

  protected initList() {
    this.list = [];
  }

  /* istanbul ignore next */
  public fetchFromJson(action?: Action) {
    this.http.get(this.url + '?' + Date.now().valueOf(), {
      responseType: 'json',
    }).pipe(
      catchError(BaseFetchFromJsonService.handleError), // then handle the error
    ).subscribe((file: any[]) => {
      if (file && file.length) {
        let self = this;
        this.list = [];
        file.forEach(row => self.list.push(Object.values(row)));
      } else {
        this.list = file;
      }
      if (action) {
        this.store.dispatch(action);
      }
    });
  }

  /* istanbul ignore next */
  protected static handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }

    return throwError('Something bad happened; please try again later.');
  }
}
