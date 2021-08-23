import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../core/core.module';
import {ListingsRoutingModule} from './listings-routing.module';
import {ListingsComponent} from './containers/listings/listings.component';
import {CountComponent} from './components/count/count.component';
import {EntryComponent} from './components/entry/entry.component';
import {ComponentsModule} from '../components/components.module';
import {ScoreboardModule} from '../scoreboard/scoreboard.module';

@NgModule({
  declarations: [ListingsComponent, CountComponent, EntryComponent],
  imports: [
    CommonModule,
    ListingsRoutingModule,
    CoreModule,
    ComponentsModule,
    ScoreboardModule,
  ],
})
export class ListingsModule {
}
