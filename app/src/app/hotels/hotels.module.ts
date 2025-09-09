import {NgModule} from '@angular/core';
import {HotelsRoutingModule} from './hotels-routing.module';
import {HotelsComponent} from './containers/hotels/hotels.component';
import {CoreModule} from '../core/core.module';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';

@NgModule({
  declarations: [HotelsComponent],
  imports: [
    HotelsRoutingModule,
    CoreModule,
    ContentBoxComponent
  ],
})
export class HotelsModule {
}
