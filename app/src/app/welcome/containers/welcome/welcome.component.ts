import {Component, Inject, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {LightboxComponent} from '../../../components/components/lightbox/lightbox.component';
import {select, Store} from '@ngrx/store';
import {selectConfig} from '../../../core/selectors/config.selector';
import {State} from '../../../core/models/state.model';
import {selectContent} from '../../../core/selectors/content.selector';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class WelcomeComponent {

  public config = toSignal(this.store.pipe(select(selectConfig)));
  public content = toSignal(this.store.pipe(select(selectContent)));

  constructor(private store: Store<State>, @Inject(MatDialog) public dialog: MatDialog) {
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
