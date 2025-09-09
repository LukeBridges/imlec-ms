import {NgModule} from '@angular/core';
import {WelcomeRoutingModule} from './welcome-routing.module';
import {WelcomeComponent} from './containers/welcome/welcome.component';
import {CoreModule} from '../core/core.module';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    WelcomeRoutingModule,
    MatButtonModule,
    MatDialogModule,
    CoreModule,
    ContentBoxComponent
  ],
})
export class WelcomeModule {
}
