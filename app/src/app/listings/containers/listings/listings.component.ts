import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {LocoModel} from '../../../core/models/loco.model';
import {select, Store} from '@ngrx/store';
import {selectEntries} from '../../selectors/entries.selector';
import * as EntriesActions from '../../actions/entries.actions';
import {delay, filter, take, takeUntil} from 'rxjs/operators';
import {State} from '../../../core/models/state.model';
import {Config} from '../../../core/models/config.model';
import {selectConfig} from '../../../core/selectors/config.selector';

@Component({
  selector: 'app-listings',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.css'],
})
export class ListingsComponent implements OnInit, OnDestroy {

  public entries$: Observable<LocoModel[]>;
  public entries: LocoModel[];

  public config: Config;
  private config$: Observable<Config> = new Observable<Config>();

  protected ngUnsubscribe$: Subject<any> = new Subject();

  constructor(@Inject(Store) private store: Store<State>) {
    this.entries$ = this.store.pipe(select(selectEntries));
    this.config$ = this.store.pipe(select(selectConfig));
  }

  ngOnInit() {
    this.entries$.pipe(takeUntil(this.ngUnsubscribe$), take(5), delay(1000)).
      subscribe((entries: LocoModel[]) => {
        if (!entries || entries && entries.length < 1) {
          this.store.dispatch(EntriesActions.getEntries());
        } else {
          this.entries = entries;
        }
      });
    this.config$.pipe(takeUntil(this.ngUnsubscribe$), filter(config => !!config)).
      subscribe(config => {
        this.config = config;
      });
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(null);
    this.ngUnsubscribe$.complete();
  }

  get hasEntries(): boolean {
    return this.entries?.length > 0;
  }
}
