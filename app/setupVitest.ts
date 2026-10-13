import '@angular/compiler';
import {setupTestBed} from '@analogjs/vitest-angular/setup-testbed';

setupTestBed();

//IMLEC Context Setup
window['IMLEC'] = {
  hash: 'testHash'
};
