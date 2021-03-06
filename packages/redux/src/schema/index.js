import createReducer from './createReducer';
import createSelector from './createSelector';
import createActor from './createActor';
import createAction from './createAction';

import GroupBy from './groupBy';

const reservedKeyWords = [
  'allIds', 'byId', 'version',
  'length', 'values', 'by', '_',
  'memoize',
];

export default function schema(name, version, groupByDefs = null) {
  // Create object based on the groupBys
  if (typeof groupByDefs !== 'object') {
    throw new Error('GroupBys is supposed to be an object definition');
  }

  const groupBys = groupByDefs
    ? Object.keys(groupByDefs).map((key) => {
      if (reservedKeyWords.includes(key)) {
        throw new Error(`GroupBy name ${key} in schema ${name} is a reserved keyword.`);
      }
      return new GroupBy(key, groupByDefs[key]);
    }) : [];

  return {
    name,
    getReducer: () => createReducer(name, version, groupBys),
    getSelector: getState => createSelector(getState, groupBys),
    getActor: dispatch => createActor(name, dispatch, groupBys),
    getAction: () => createAction(name),
    onSave: state => state,
    onRestore: (state) => {
      if (state === null || state === undefined) return state;

      // Avoid errors arising due to version incompatibility
      const restoreState = state;
      restoreState._ = state._;
      let changed = false;
      groupBys.forEach((groupBy) => {
        const prevState = state[groupBy.name];
        const nextState = groupBy.onRestore(prevState, restoreState._);
        restoreState[groupBy.name] = nextState;
        changed = changed || prevState !== nextState;
      });

      // In case the some of the index has been removed, then
      // also consider the state as changed
      changed = changed || (Object.keys(state).length !== Object.keys(restoreState).length);

      return changed ? restoreState : state;
    },
  };
}
