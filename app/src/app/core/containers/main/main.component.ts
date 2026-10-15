import {Component, Inject, OnInit, DOCUMENT, ChangeDetectionStrategy, effect} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver} from '@angular/cdk/layout';
import {map} from 'rxjs';
import {MatSidenavModule} from '@angular/material/sidenav';
import {RouterOutlet} from '@angular/router';
import {select, Store} from '@ngrx/store';
import * as RouterActions from '../../actions/router.actions';
import * as ConfigActions from '../../actions/config.actions';
import * as ContentActions from '../../actions/content.actions';
import {State} from '../../models/state.model';
import {selectConfig} from '../../selectors/config.selector';
import {HeaderComponent} from '../../components/header/header.component';
import {SidebarComponent} from '../../components/sidebar/sidebar.component';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatSidenavModule, RouterOutlet, HeaderComponent, SidebarComponent]
})
export class MainComponent implements OnInit {

  public config = toSignal(this.store.pipe(select(selectConfig)));

  public isDesktop = toSignal(
    this.breakpointObserver.observe('(min-width: 600px)').pipe(map(result => result.matches)),
    {initialValue: false}
  );

  constructor(
    @Inject(Store) private store: Store<State>,
    @Inject(DOCUMENT) private document: Document,
    @Inject(BreakpointObserver) private breakpointObserver: BreakpointObserver
  ) {
    effect(() => {
      const primaryColour = this.config()?.primaryColour;
      if (primaryColour) {
        this.document.documentElement.style.setProperty('--mat-sys-primary', primaryColour);
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(ConfigActions.getConfig());
    this.store.dispatch(ContentActions.getContent());
    this.store.dispatch(RouterActions.Go({path: ['/welcome']}));
  }
}
