import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CountComponent {

  @Input() count: number;

  constructor() {
  }
}
