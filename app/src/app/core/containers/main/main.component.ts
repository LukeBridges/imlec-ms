import {Component, Inject, OnInit, DOCUMENT, ChangeDetectionStrategy, effect} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {select, Store} from '@ngrx/store';
import * as RouterActions from '../../actions/router.actions';
import * as ConfigActions from '../../actions/config.actions';
import * as ContentActions from '../../actions/content.actions';
import {State} from '../../models/state.model';
import {selectConfig} from '../../selectors/config.selector';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class MainComponent implements OnInit {

  public config = toSignal(this.store.pipe(select(selectConfig)));

  constructor(
    @Inject(Store) private store: Store<State>,
    @Inject(DOCUMENT) private document: Document
  ) {
    effect(() => {
      const primaryColour = this.config()?.primaryColour;
      if (primaryColour) {
        this.document.documentElement.style.setProperty('--primary-colour', primaryColour);
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(ConfigActions.getConfig());
    this.store.dispatch(ContentActions.getContent());
    this.store.dispatch(RouterActions.Go({path: ['/welcome']}));
  }
}
