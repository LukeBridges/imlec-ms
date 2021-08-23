import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomeRoutingModule} from './welcome-routing.module';
import {WelcomeComponent} from './containers/welcome/welcome.component';
import {CoreModule} from '../core/core.module';
import {ComponentsModule} from '../components/components.module';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    CommonModule,
    WelcomeRoutingModule,
    MatButtonModule,
    MatDialogModule,
    CoreModule,
    ComponentsModule,
  ],
})
export class WelcomeModule {
}
