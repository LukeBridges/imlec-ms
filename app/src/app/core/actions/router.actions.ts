import {Action, createAction, props} from '@ngrx/store';
import {NavigationExtras} from '@angular/router';

export const Go = createAction('[Router] Go', props<{
  path: any[];
  extras?: NavigationExtras;
  onCompletion?: Action[]
}>());
