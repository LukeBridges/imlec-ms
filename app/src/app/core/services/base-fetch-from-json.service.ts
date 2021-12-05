import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {throwError} from 'rxjs';
import {Store} from '@ngrx/store';
import {catchError} from 'rxjs/operators';
import {Inject, Injectable} from '@angular/core';
import {State} from '../models/state.model';

@Injectable({providedIn: 'root'})
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
  public async fetchFromJson() {
    const file: any | [] = await this.http.get(this.url + '?' + Date.now().valueOf(), {
      responseType: 'json',
    }).pipe(
      catchError(BaseFetchFromJsonService.handleError), // then handle the error
    ).toPromise();
    if (file && file.length) {
      let self = this;
      this.list = [];
      file.forEach(row => self.list.push(Object.values(row)));
    } else {
      this.list = file;
    }
    return this.list;
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
