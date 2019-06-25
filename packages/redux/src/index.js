import { useEffect, useState } from 'react';
import schema from './schema';
import shallowEqual from './shallowEqual';

function destructure(structure, method) {
  const result = Object.keys(structure).reduce((res, key) => {
    res[key] = method(structure[key], key);
    return res;
  }, {});

  return result;
}

export function createReducer(structure) {
  return destructure(structure, item => item.getReducer());
}

export function createSelector(structure, store) {
  const selector = destructure(structure, (item, key) => {
    const getState = () => store.getState()[key];
    return item.getSelector(getState);
  });

  return function useSelector(mapState, dependencies = []) {
    const [state, setState] = useState(() => mapState(selector, dependencies));

    // useEffect uses the state value to initialize the prevValue without
    // keeping it in dependency, which is safe.
    useEffect(() => {
      let prevValue = state;

      return store.subscribe(() => {
        const newValue = mapState(selector, dependencies);
        if (!shallowEqual(newValue, prevValue)) {
          prevValue = newValue;
          setState(newValue);
        }
      });
    }, dependencies);

    return state;
  };
}

export function createActor(structure, dispatch) {
  return destructure(structure, item => item.getActor(dispatch));
}

export {
  schema,
};
