import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-rules',
    templateUrl: './rules.component.html',
    styleUrls: ['./rules.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RulesComponent {

  constructor() {
  }
}
