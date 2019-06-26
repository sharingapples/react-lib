import destructure from './destructure';

const HYDRATE = 'sa.rdx.hydrate';

export default function createHydrator(structure, save) {
  let saving = null;
  function triggerStorage(newState) {
    if (saving) {
      saving = newState;
      return;
    }
    saving = newState;

    // Perform a save after few milliseconds to avoid consecutive save requests
    setTimeout(() => {
      save(saving);
      saving = null;
    }, 100);
  }

  return {
    enhanceReducer: (reducer) => {
      return (state, action) => {
        if (action.type === HYDRATE) {
          triggerStorage(action.payload);
          return action.payload;
        }
        const newState = reducer(state, action);
        if (state !== newState) {
          // Save state to persistent storage
          triggerStorage(newState);
        }
        return newState;
      };
    },

    hydrate: (store, state) => {
      const newState = destructure(structure, (item, key) => {
        const stateByKey = state[key];
        return item.onRestore(stateByKey);
      });

      store.dispatch({ type: HYDRATE, payload: newState });
    },
  };
}
