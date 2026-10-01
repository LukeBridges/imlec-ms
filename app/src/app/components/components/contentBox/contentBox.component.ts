import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-contentbox',
    templateUrl: './contentBox.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./contentBox.component.scss'],
})
export class ContentBoxComponent {
  constructor() {
  }
}
