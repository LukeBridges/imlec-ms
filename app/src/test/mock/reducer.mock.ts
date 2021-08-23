import {Action, ActionReducer} from '@ngrx/store';

export enum MockActionTypes {
  Mock = 'Mock',
}

export function mockMetaReducer(reducer: ActionReducer<any>): ActionReducer<any, any> {
  return (state: any, action: any): any => {
    switch (action.type) {
      case MockActionTypes.Mock:
        return reducer({...state, ...action.payload}, action);
    }

    return reducer(state, action);
  };
}

export class Mock implements Action {
  constructor(public payload: any) {
  }

  readonly type = MockActionTypes.Mock;
}

export type MockActions = Mock;
