import { useEffect, useState, useRef } from 'react';
import schema from './schema';
import record from './record';
import createHydrator from './hydrator';

import shallowEqual from './shallowEqual';
import destructure from './destructure';
import arrayEqual from './arrayEqual';

export function createReducer(structure) {
  return destructure(structure, item => item.getReducer());
}

export function useSelectorMemo(fn) {
  const cache = useRef(null);

  return function memo(...args) {
    if (cache.current && arrayEqual(args, cache.current.args)) return cache.current.value;
    const value = fn(...args);
    cache.current = { args, value };
    return value;
  };
}

export function createSelector(structure, store) {
  const selector = destructure(structure, (item, key) => {
    const getState = () => store.getState()[key];
    return item.getSelector(getState);
  });

  return function useSelector(mapState, dependencies = [], memo) {
    const [state, setState] = useState(() => mapState(selector, dependencies, memo));

    // useEffect uses the state value to initialize the prevValue without
    // keeping it in dependency, which is safe.
    useEffect(() => {
      let prevValue = state;

      function updateState() {
        const newValue = mapState(selector, dependencies, memo);
        if (!shallowEqual(newValue, prevValue)) {
          prevValue = newValue;
          setState(newValue);
        }
      }

      // Perform a state update as soon as the dependency changes
      updateState();
      return store.subscribe(updateState);
    }, dependencies);

    return state;
  };
}

export function createActor(structure, dispatch) {
  return destructure(structure, item => item.getActor(dispatch));
}

export {
  schema,
  record,
  createHydrator,
};
