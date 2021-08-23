import {NgModule} from '@angular/core';
import {BoardComponent} from './containers/board/board.component';
import {CommonModule} from '@angular/common';
import {ScoresService} from './services/scores.service';
import {RouterModule} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {ScoresEffects} from './effects/scores.effects';
import {StoreModule} from '@ngrx/store';
import {HttpClientModule} from '@angular/common/http';
import * as fromScores from './reducers/scores.reducer';
import {EntriesEffects} from '../listings/effects/entries.effects';
import {EntriesService} from '../listings/services/entries.service';
import * as fromEntries from '../listings/reducers/entries.reducer';
import {CoreModule} from '../core/core.module';
import {ScoreboardRoutingModule} from './scoreboard-routing.module';
import {ComponentsModule} from '../components/components.module';

@NgModule({
  declarations: [
    BoardComponent,
  ],
  imports: [
    CommonModule,
    ScoreboardRoutingModule,
    StoreModule.forFeature('scores', fromScores.reducer),
    StoreModule.forFeature('entries', fromEntries.reducer),
    EffectsModule.forFeature([ScoresEffects, EntriesEffects]),
    HttpClientModule,
    CoreModule,
    ComponentsModule,
  ],
  providers: [
    ScoresService,
    EntriesService,
  ],
  exports: [
    RouterModule,
  ],
})
export class ScoreboardModule {

}
