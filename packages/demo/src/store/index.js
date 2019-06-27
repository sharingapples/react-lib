/* global window, localStorage */
import { createStore, combineReducers } from 'redux';
import {
  createReducer, createSelector, createActor,
  schema, record,
  createHydrator,
  useSelectorMemo,
} from '@sharingapples/redux';

const user = record('user');
const books = schema('books', 1);
const authors = schema('authors', 1);

const structure = { user, books, authors };

const hydrator = createHydrator(structure, (state) => {
  localStorage.setItem('my-key', JSON.stringify(state));
});

const reducer = hydrator.enhanceReducer(combineReducers(createReducer(structure)));
const store = createStore(
  reducer,
  // eslint-disable-next-line no-underscore-dangle
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const data = localStorage.getItem('my-key');
if (data) {
  hydrator.hydrate(store, JSON.parse(data));
}
window.addEventListener('storage', (e) => {
  if (e.key === 'my-key') {
    console.log('[Render]', e.newValue, typeof e.newValue);
    hydrator.hydrate(store, JSON.parse(e.newValue));
  }
});


export const useSelector = createSelector(structure, store);
export const reduxDB = createActor(structure, store.dispatch);
export { useSelectorMemo };
