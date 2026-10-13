import {enableProdMode, ViewEncapsulation, provideZonelessChangeDetection} from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowser().bootstrapModule(AppModule, { applicationProviders: [provideZonelessChangeDetection()], defaultEncapsulation: ViewEncapsulation.None,}).catch(err => console.error(err));
