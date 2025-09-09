import {NgModule} from '@angular/core';
import {CoreModule} from '../core/core.module';
import {ListingsRoutingModule} from './listings-routing.module';
import {ListingsComponent} from './containers/listings/listings.component';
import {CountComponent} from './components/count/count.component';
import {EntryComponent} from './components/entry/entry.component';
import {StoreModule} from '@ngrx/store';
import * as fromEntries from './reducers/entries.reducer';
import {EffectsModule} from '@ngrx/effects';
import {EntriesEffects} from './effects/entries.effects';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {ContentBoxComponent} from '../components/components/contentBox/contentBox.component';
import {SpinnerComponent} from "../components/components/spinner/spinner.component";

@NgModule({
  declarations: [
    ListingsComponent,
    CountComponent,
    EntryComponent
  ],
  imports: [
    ListingsRoutingModule,
    CoreModule,
    StoreModule.forFeature('entries', fromEntries.reducer),
    EffectsModule.forFeature([EntriesEffects]),
    ContentBoxComponent,
    SpinnerComponent
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class ListingsModule {
}
