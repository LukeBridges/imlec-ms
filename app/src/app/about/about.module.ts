import {NgModule} from '@angular/core';
import {AboutRoutingModule} from './about-routing.module';
import {CoreModule} from '../core/core.module';
import {AboutComponent} from './containers/about/about.component';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    AboutRoutingModule,
    CoreModule,
    ContentBoxComponent
  ],
})
export class AboutModule {
}
