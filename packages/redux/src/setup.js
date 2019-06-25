import { createStore, combineReducers } from 'redux';
import { useState, useEffect, useCallback } from 'react';

import shallowEqual from './shallowEqual';

export default function setup(structure) {
  const reducer = combineReducers(Object.keys(structure).reduce((res, key) => {
    res[key] = structure[key].reducer(key);
    return res;
  }, {}));

  const store = createStore(reducer);

  const reduxDB = {};
  const selector = {};
  Object.keys(structure).forEach((key) => {
    const item = structure[key];
    reduxDB[key] = item.actions(key, store.dispatch);
    selector[key] = item.selector(key, store.getState);
  }, {});

  const useReduxDB = (mapState, dependencies = []) => {
    const mapper = useCallback(mapState, dependencies);
    const [value, setValue] = useState(() => mapState(selector(store.getState())));

    useEffect(() => {
      let previous = value;
      function updateValue() {
        const state = store.getState();
        const next = mapper(selector(state));
        if (next === previous || shallowEqual(previous, next)) {
          return;
        }

        previous = next;
        setValue(next);
      }

      updateValue();
      return store.subscribe(updateValue);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapper]);
    return value;
  };

  return {
    reduxDB,
    useReduxDB,
  };
}
