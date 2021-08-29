import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './components/header/header.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {AppRoutingModule} from './app-routing.module';
import {MainComponent} from './containers/main/main.component';
import {WINDOW_PROVIDERS} from './services/window.service';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {ConfigService} from './services/config.service';
import {EffectsModule} from '@ngrx/effects';
import {ConfigEffects} from './effects/config.effects';
import {HttpClientModule} from '@angular/common/http';

const COMPONENTS = [
  HeaderComponent,
  SidebarComponent,
  MainComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [
    CommonModule,
    AppRoutingModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    EffectsModule.forFeature([ConfigEffects]),
  ],
  exports: COMPONENTS,
  providers: [
    WINDOW_PROVIDERS,
    ConfigService,
  ],
})
export class CoreModule {
}
