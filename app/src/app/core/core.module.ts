import {NgModule} from '@angular/core';
import {HeaderComponent} from './components/header/header.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {AppRoutingModule} from './app-routing.module';
import {MainComponent} from './containers/main/main.component';
import {WINDOW_PROVIDERS} from './services/window.service';
import {EffectsModule} from '@ngrx/effects';
import {ConfigEffects} from './effects/config.effects';
import {ContentEffects} from './effects/content.effects';

@NgModule({
  imports: [
    AppRoutingModule,
    HeaderComponent,
    SidebarComponent,
    MainComponent,
    EffectsModule.forFeature([ConfigEffects, ContentEffects]),
  ],
  providers: [
    WINDOW_PROVIDERS,
  ],
})
export class CoreModule {
}
