import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-winners',
    templateUrl: './winners.component.html',
    styleUrls: ['./winners.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    standalone: false
})
export class WinnersComponent {

  constructor() {
  }
}
