import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'app-food',
    templateUrl: './food.component.html',
    styleUrls: ['./food.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FoodComponent {

  constructor() {
  }
}
