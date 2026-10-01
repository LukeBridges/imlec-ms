import {Component, Input, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-count',
    templateUrl: './count.component.html',
    styleUrls: ['./count.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CountComponent {

  @Input() count: number = 0;

  constructor() {
  }
}
