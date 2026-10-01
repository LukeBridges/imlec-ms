import {Component, Input, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {

  @Input() show: boolean = true;

  constructor() {
  }
}
