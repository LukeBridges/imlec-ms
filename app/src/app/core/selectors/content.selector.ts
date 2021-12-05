import {State} from '../reducers/content.reducer';

export const selectContent = (state): State => state && state.content;
