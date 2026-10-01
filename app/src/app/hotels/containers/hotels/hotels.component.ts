import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-hotels',
    templateUrl: './hotels.component.html',
    styleUrls: ['./hotels.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HotelsComponent {

  constructor() {
  }
}
