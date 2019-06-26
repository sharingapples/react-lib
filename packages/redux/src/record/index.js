const ACTION_UPDATE = 'rec.update';
const ACTION_REPLACE = 'rec.replace';
const ACTION_CLEAR = 'rec.clear';

function createReducer(scope) {
  return function reducer(state = null, action) {
    if (action.scope !== scope) return state;
    switch (action.type) {
      case ACTION_UPDATE:
        if (state === null) return action.payload;
        return {
          ...state,
          ...action.payload,
        };
      case ACTION_REPLACE:
        return action.payload;
      case ACTION_CLEAR:
        return null;
      default:
        return state;
    }
  };
}

function createSelector(getState) {
  return {
    get: getState,
  };
}

function createActor(scope, dispatch) {
  return {
    update: item => dispatch({ scope, type: ACTION_UPDATE, payload: item }),
    replace: item => dispatch({ scope, type: ACTION_REPLACE, payload: item }),
    clear: () => dispatch({ scope, type: ACTION_CLEAR }),
  };
}

export default function record(scope) {
  return {
    getReducer: () => createReducer(scope),
    getSelector: getState => createSelector(getState),
    getActor: dispatch => createActor(scope, dispatch),
    onSave: state => state,
    onRestore: state => state,
  };
}
