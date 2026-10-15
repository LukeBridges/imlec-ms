import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

@Component({
    selector: 'app-food',
    templateUrl: './food.component.html',
    styleUrls: ['./food.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ContentBoxComponent]
})
export class FoodComponent {

  constructor() {
  }
}
