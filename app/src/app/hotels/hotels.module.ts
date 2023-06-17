import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HotelsRoutingModule} from './hotels-routing.module';
import {HotelsComponent} from './containers/hotels/hotels.component';
import {CoreModule} from '../core/core.module';
import {ComponentsModule} from '../components/components.module';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';

@NgModule({
  declarations: [HotelsComponent],
  imports: [
    CommonModule,
    HotelsRoutingModule,
    CoreModule,
    ComponentsModule,
    ContentBoxComponent
  ],
})
export class HotelsModule {
}
