import {NgModule} from '@angular/core';
import {BoardComponent} from './containers/board/board.component';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {ScoresEffects} from './effects/scores.effects';
import {StoreModule} from '@ngrx/store';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import * as fromScores from './reducers/scores.reducer';
import {CoreModule} from '../core/core.module';
import {ScoreboardRoutingModule} from './scoreboard-routing.module';
import {ListingsModule} from '../listings/listings.module';
import {SpinnerComponent} from "../components/components/spinner/spinner.component";

@NgModule({
  declarations: [
    BoardComponent,
  ],
  exports: [
    RouterModule,
  ],
  imports: [
    CommonModule,
    ScoreboardRoutingModule,
    StoreModule.forFeature('scores', fromScores.reducer),
    EffectsModule.forFeature([ScoresEffects]),
    CoreModule,
    ListingsModule,
    SpinnerComponent
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class ScoreboardModule {

}
