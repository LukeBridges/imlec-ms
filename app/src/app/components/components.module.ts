import {LightboxComponent} from './components/lightbox/lightbox.component';
import {SpinnerComponent} from './components/spinner/spinner.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppRoutingModule} from '../core/app-routing.module';
import {SafePipe} from './pipe/safe.pipe';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';

const COMPONENTS = [
  LightboxComponent,
  SpinnerComponent,
];

@NgModule({
  declarations: [...COMPONENTS, SafePipe],
  imports: [
    CommonModule,
    AppRoutingModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
  ],
  exports: COMPONENTS,
})
export class ComponentsModule {
}
