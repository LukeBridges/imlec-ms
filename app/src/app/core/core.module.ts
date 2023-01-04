import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './components/header/header.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {AppRoutingModule} from './app-routing.module';
import {MainComponent} from './containers/main/main.component';
import {WINDOW_PROVIDERS} from './services/window.service';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {EffectsModule} from '@ngrx/effects';
import {ConfigEffects} from './effects/config.effects';
import {ContentEffects} from './effects/content.effects';

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
    EffectsModule.forFeature([ConfigEffects, ContentEffects]),
  ],
  exports: COMPONENTS,
  providers: [
    WINDOW_PROVIDERS,
  ],
})
export class CoreModule {
}
