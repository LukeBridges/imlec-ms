import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AboutRoutingModule} from './about-routing.module';
import {CoreModule} from '../core/core.module';
import {ComponentsModule} from '../components/components.module';
import {AboutComponent} from './containers/about/about.component';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    AboutRoutingModule,
    CoreModule,
    ComponentsModule,
    ContentBoxComponent
  ],
})
export class AboutModule {
}
