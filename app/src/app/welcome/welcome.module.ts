import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomeRoutingModule} from './welcome-routing.module';
import {WelcomeComponent} from './containers/welcome/welcome.component';
import {CoreModule} from '../core/core.module';
import {ComponentsModule} from '../components/components.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    CommonModule,
    WelcomeRoutingModule,
    MatButtonModule,
    MatDialogModule,
    CoreModule,
    ComponentsModule,
    ContentBoxComponent
  ],
})
export class WelcomeModule {
}
