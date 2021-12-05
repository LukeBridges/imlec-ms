import * as ContentActions from '../actions/content.actions';
import {Action, createReducer, on} from '@ngrx/store';
import {BlankContentItem, Content} from '../models/content.model';

export type State = Content;

export const initialState: State = {
  welcome: BlankContentItem
};

const configReducer = createReducer(
  initialState,
  on(ContentActions.updateContent,
    (state, {payload}) => (payload)),
);

export function reducer(state: State | undefined, action: Action) {
  return configReducer(state, action);
}
