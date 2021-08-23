import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WinnersRoutingModule} from './winners-routing.module';
import {WinnersComponent} from './containers/winners/winners.component';
import {CoreModule} from '../core/core.module';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  declarations: [WinnersComponent],
  imports: [
    CommonModule,
    WinnersRoutingModule,
    CoreModule,
    ComponentsModule,
  ],
})
export class WinnersModule {
}
