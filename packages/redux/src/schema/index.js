import createReducer from './createReducer';
import createSelector from './createSelector';
import createActor from './createActor';

import GroupBy from './groupBy';

const reservedKeyWords = [
  'allIds', 'byId', 'version',
  'length', 'values', 'by', '_',
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
    getReducer: () => createReducer(name, version, groupBys),
    getSelector: getState => createSelector(getState, groupBys),
    getActor: dispatch => createActor(name, dispatch, groupBys),
    onSave: state => state,
    onRestore: (state) => {
      // Avoid errors arising due to version incompatibility
      const restoreState = state;
      restoreState._ = state._;
      let changed = false;
      groupBys.forEach((groupBy) => {
        const prevState = state[groupBy.name];
        const nextState = groupBy.onRestore(prevState);
        restoreState[groupBy.name] = nextState;
        changed = changed || prevState !== nextState;
      });
      return changed ? restoreState : state;
    },
  };
}
