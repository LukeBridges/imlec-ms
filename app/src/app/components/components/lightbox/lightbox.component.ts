import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {SafePipe} from "../../pipe/safe.pipe";

export interface LightBoxData {
  title: string,
  src?: string,
  href?: string,
}

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss'],
  imports: [
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    SafePipe
  ]
})
export class LightboxComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: LightBoxData) {
  }
}
