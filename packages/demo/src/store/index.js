/* global window */
import { createStore, combineReducers } from 'redux';
import {
  createReducer, createSelector, createActor,
  schema, record,
} from '@sharingapples/redux';

const user = record('user');
const books = schema('books', 1);
const authors = schema('authors', 1);

const structure = { user, books, authors };

const reducer = combineReducers(createReducer(structure));
const store = createStore(
  reducer,
  // eslint-disable-next-line no-underscore-dangle
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export const useSelector = createSelector(structure, store);
export const reduxDB = createActor(structure, store.dispatch);
