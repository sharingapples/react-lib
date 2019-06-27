import { useLayoutEffect, useEffect, useState, useRef } from 'react';
import schema from './schema';
import record from './record';
import createHydrator from './hydrator';

import shallowEqual from './shallowEqual';
import destructure from './destructure';
import arrayEqual from './arrayEqual';

// Shamelessly copied comment from:
//    https://github.com/reduxjs/react-redux/blob/316467a07e29911d82ba0342364a907e05d9066c/src/hooks/useSelector.js#L6
// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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

  // With useEffect, the subscription happens for the child first and then
  // the parent. This would create an unintended behaviour when the state
  // needs to be updated. When a state tree changes a parent component
  // should be updated prior to the children. Hence a suscriber is created
  // on a per instance basis
  function createSubscriber() {
    let attached;

    const unsubscribe = store.subscribe(() => {
      if (attached) attached();
    });

    return {
      subscribe: (listener) => {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          if (attached) console.warn('Invalid state there should not be any previously attached listeners');
        }

        // Invoke the listener when the dependency changes. The useEffect hook would be
        // reattached in this scenario, and taking this opportunity to trigger the listener
        if (attached === null) listener();
        attached = listener;
        return () => {
          attached = null;
        };
      },

      // Called only when the component is unmounted
      unsubscribe,
    };
  }

  return function useSelector(mapState, dependencies = [], memo) {
    const instance = useRef(null);
    const [state, setState] = useState(() => mapState(selector, dependencies, memo));

    if (instance.current === null) {
      instance.current = createSubscriber();
    }

    // useEffect uses the state value to initialize the prevValue without
    // keeping it in dependency, which is safe.
    useIsomorphicLayoutEffect(() => {
      let prevValue = state;

      function updateState() {
        const newValue = mapState(selector, dependencies, memo);
        if (!shallowEqual(newValue, prevValue)) {
          prevValue = newValue;
          setState(newValue);
        }
      }

      return instance.current.subscribe(updateState);
    }, dependencies);

    // An unmount effect
    useIsomorphicLayoutEffect(() => {
      return instance.current.unsubscribe;
    }, []);

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
