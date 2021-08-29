import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../core/core.module';
import {ListingsRoutingModule} from './listings-routing.module';
import {ListingsComponent} from './containers/listings/listings.component';
import {CountComponent} from './components/count/count.component';
import {EntryComponent} from './components/entry/entry.component';
import {ComponentsModule} from '../components/components.module';
import {StoreModule} from '@ngrx/store';
import * as fromEntries from './reducers/entries.reducer';
import {EntriesService} from './services/entries.service';
import {EffectsModule} from '@ngrx/effects';
import {EntriesEffects} from './effects/entries.effects';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [ListingsComponent, CountComponent, EntryComponent],
  imports: [
    CommonModule,
    ListingsRoutingModule,
    CoreModule,
    ComponentsModule,
    HttpClientModule,
    StoreModule.forFeature('entries', fromEntries.reducer),
    EffectsModule.forFeature([EntriesEffects]),
  ],
  providers: [
    EntriesService,
  ],
})
export class ListingsModule {
}
