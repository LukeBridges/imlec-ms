import {Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LightboxComponent} from '../../../components/components/lightbox/lightbox.component';
import {Observable, Subject} from 'rxjs';
import {Config} from '../../../core/models/config.model';
import {select, Store} from '@ngrx/store';
import {selectConfig} from '../../../core/selectors/config.selector';
import {State} from '../../../core/models/state.model';
import {filter, takeUntil} from 'rxjs/operators';
import {Content} from '../../../core/models/content.model';
import {selectContent} from '../../../core/selectors/content.selector';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    standalone: false
})
export class WelcomeComponent implements OnInit, OnDestroy {

  public config: Config;
  private config$: Observable<Config> = new Observable<Config>();
  public content: Content;
  private content$: Observable<Content> = new Observable<Content>();
  private ngUnsubscribe$: Subject<any> = new Subject<any>();

  constructor(private store: Store<State>, @Inject(MatDialog) public dialog: MatDialog) {
    this.config$ = this.store.pipe(select(selectConfig));
    this.content$ = this.store.pipe(select(selectContent));
  }

  ngOnInit() {
    this.config$.pipe(takeUntil(this.ngUnsubscribe$), filter(config => !!config)).
      subscribe(config => {
        this.config = config;
      });
    this.content$.pipe(takeUntil(this.ngUnsubscribe$), filter(content => !!content)).
      subscribe(content => {
        this.content = content;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  openGMap() {
    this.dialog.open(LightboxComponent, {
      data: {
        title: 'MMES and Track Location',
        href: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2496.228227270311!2d0.5466457!3d51.2701179!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47df321a48343a95%3A0xc93d77fc3ab66489!2sMote%20Park%20Miniature%20Railway!5e0!3m2!1sen!2suk!4v1613056130338!5m2!1sen!2suk',
      },
    });
  }

  openMap() {
    this.dialog.open(LightboxComponent, {
      data: {
        title: 'MMES Track and Gradient Map',
        src: 'Mote Park_2-image.png',
      },
    });
  }
}
