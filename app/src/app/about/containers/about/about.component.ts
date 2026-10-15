import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ContentBoxComponent]
})
export class AboutComponent {

  constructor() {
  }
}
