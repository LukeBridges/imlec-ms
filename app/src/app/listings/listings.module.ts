import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import * as fromEntries from './reducers/entries.reducer';
import {EntriesEffects} from './effects/entries.effects';

// istanbul ignore next
const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./containers/listings/listings.component').then(m => m.ListingsComponent),
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    StoreModule.forFeature('entries', fromEntries.reducer),
    EffectsModule.forFeature([EntriesEffects]),
  ],
})
export class ListingsModule {
}
