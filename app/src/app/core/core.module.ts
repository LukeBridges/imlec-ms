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
  ],
  exports: COMPONENTS,
  providers: [
    WINDOW_PROVIDERS,
  ],
})
export class CoreModule {
}
