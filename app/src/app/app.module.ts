import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './core/containers/app/app.component';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {APP_BASE_HREF, CommonModule, PlatformLocation} from '@angular/common';
import {
  DefaultRouterStateSerializer,
  RouterStateSerializer,
  StoreRouterConnectingModule,
} from '@ngrx/router-store';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {CustomRouterStateSerializer, metaReducers, reducers} from './core/reducers';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule.withConfig({disableAnimations: !environment.production}),
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () => import('./core/core.module').then(
          m => m.CoreModule),
      },
    ], {relativeLinkResolution: 'legacy'}),
    EffectsModule.forRoot([]),
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
    environment.production ? [] : StoreDevtoolsModule.instrument(),
    StoreRouterConnectingModule.forRoot(
      {serializer: DefaultRouterStateSerializer, stateKey: 'router'}),
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
  }
}

export function getBaseHref(platformLocation: PlatformLocation): string {
  return '/imlec';
}
