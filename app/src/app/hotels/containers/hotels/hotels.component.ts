import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

@Component({
    selector: 'app-hotels',
    templateUrl: './hotels.component.html',
    styleUrls: ['./hotels.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ContentBoxComponent]
})
export class HotelsComponent {

  constructor() {
  }
}
