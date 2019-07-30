import { reducer as normalizedReducer } from './normalized';

export default function createReducer(schema, version, groupBys) {
  // Handle common scenario, no groupBys
  if (groupBys.length === 0) {
    return (state = { version }, action) => {
      if (action.schema !== schema) return state;

      const next = normalizedReducer(state._, action);
      if (next === state._) return state;
      return { _: next, version };
    };
  }

  const reducers = {
    _: normalizedReducer,
  };

  groupBys.forEach((groupBy) => {
    reducers[groupBy.name] = groupBy.getReducer();
  });

  const reducerKeys = Object.keys(reducers);

  // The schema reducer
  return (state = { version }, action) => {
    if (action.schema !== schema) return state;
    let hasChanged = false;
    const nextState = { version };
    for (let i = 0; i < reducerKeys.length; i += 1) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      const prevStateForKey = state[key];
      const nextStateForKey = reducer(prevStateForKey, action);
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || (nextStateForKey !== prevStateForKey);
    }
    return hasChanged ? nextState : state;
  };
}
