import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import * as RouterActions from '../../actions/router.actions';
import * as ConfigActions from '../../actions/config.actions';
import {State} from '../../models/state.model';
import {Observable, Subject} from 'rxjs';
import {Config} from '../../models/config.model';
import {selectConfig} from '../../selectors/config.selector';
import {filter, takeUntil} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {

  public config: Config;
  private config$: Observable<Config> = new Observable<Config>();
  private ngUnsubscribe$: Subject<any> = new Subject<any>();

  constructor(private store: Store<State>, @Inject(DOCUMENT) private document: Document) {
    this.config$ = this.store.pipe(select(selectConfig));
  }

  ngOnInit() {
    this.config$.pipe(takeUntil(this.ngUnsubscribe$), filter(config => !!config)).
      subscribe(config => {
        this.config = config;
        this.document.documentElement.style.setProperty('--primary-colour', config?.primaryColour);
      });

    this.store.dispatch(ConfigActions.getConfig());
    this.store.dispatch(RouterActions.Go({path: ['/welcome']}));
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
