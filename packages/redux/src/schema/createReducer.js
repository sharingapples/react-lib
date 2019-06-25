import { combineReducers } from 'redux';
import { reducer as normalizedReducer } from './normalized';

export default function createReducer(schema, groupBys) {
  const reducers = {
    _: normalizedReducer,
  };

  groupBys.forEach((groupBy) => {
    reducers[groupBy.name] = groupBy.getReducer();
  });

  const reducer = combineReducers(reducers);

  // The schema reducer
  return (state = {}, action) => {
    if (action.schema !== schema) return state;
    return reducer(state, action);
  };
}
