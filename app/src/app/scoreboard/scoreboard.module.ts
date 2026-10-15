import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import * as fromScores from './reducers/scores.reducer';
import {ScoresEffects} from './effects/scores.effects';
import * as fromEntries from '../listings/reducers/entries.reducer';
import {EntriesEffects} from '../listings/effects/entries.effects';

// istanbul ignore next
const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./containers/board/board.component').then(m => m.BoardComponent),
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    StoreModule.forFeature('scores', fromScores.reducer),
    StoreModule.forFeature('entries', fromEntries.reducer),
    EffectsModule.forFeature([ScoresEffects, EntriesEffects]),
  ],
})
export class ScoreboardModule {
}
