import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import * as RouterActions from '../../actions/router.actions';
import * as ConfigActions from '../../actions/config.actions';
import {State} from '../../models/state.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {

  constructor(private store: Store<State>) {
  }

  ngOnInit() {
    this.store.dispatch(ConfigActions.getConfig());
    this.store.dispatch(RouterActions.Go({path: ['/welcome']}));
  }
}
