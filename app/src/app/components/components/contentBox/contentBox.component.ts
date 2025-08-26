import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
    selector: 'app-contentbox',
    templateUrl: './contentBox.component.html',
    styleUrls: ['./contentBox.component.scss'],
    imports: [
        CommonModule
    ]
})
export class ContentBoxComponent {
  constructor() {
  }
}
