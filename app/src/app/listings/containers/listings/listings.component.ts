import {Component, Inject, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {LocoModel} from '../../../core/models/loco.model';
import {select, Store} from '@ngrx/store';
import {getEntries} from '../../selectors/entries.selector';
import * as EntriesActions from '../../actions/entries.actions';
import {takeUntil} from 'rxjs/operators';
import {State} from '../../../core/models/state.model';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-listings',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.css'],
})
export class ListingsComponent implements OnInit {

  public entries$: Observable<LocoModel[]>;
  public entries: LocoModel[];

  public features = environment.features;

  protected ngUnsubscribe$: Subject<any> = new Subject();

  constructor(@Inject(Store) private store: Store<State>) {
    this.entries$ = this.store.pipe(select(getEntries));
  }

  ngOnInit() {
    this.entries$.pipe(takeUntil(this.ngUnsubscribe$)).
      subscribe((entries: LocoModel[]) => {
        if (!entries || entries && entries.length < 1) {
          this.store.dispatch(EntriesActions.getEntries());
        } else {
          this.entries = entries;
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  get hasEntries(): boolean {
    return this.entries?.length > 0;
  }
}
