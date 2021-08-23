import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface LightBoxData {
  title: string,
  src?: string,
  href?: string,
}

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss'],
})
export class LightboxComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: LightBoxData) {
  }
}
