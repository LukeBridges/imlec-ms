import {NgModule} from '@angular/core';
import {WinnersRoutingModule} from './winners-routing.module';
import {WinnersComponent} from './containers/winners/winners.component';
import {CoreModule} from '../core/core.module';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';

@NgModule({
  declarations: [WinnersComponent],
  imports: [
    WinnersRoutingModule,
    CoreModule,
    ContentBoxComponent
  ],
})
export class WinnersModule {
}
