import createReducer from './createReducer';
import createSelector from './createSelector';
import createActor from './createActor';

import GroupBy from './groupBy';

export default function schema(name, version, groupByDefs = null) {
  // Create object based on the groupBys
  if (typeof groupByDefs !== 'object') {
    throw new Error('GroupBys is supposed to be an object definition');
  }

  const groupBys = groupByDefs
    ? Object.keys(groupByDefs).map(key => new GroupBy(key, groupByDefs[key]))
    : [];

  return {
    getReducer: () => createReducer(name, groupBys),
    getSelector: getState => createSelector(getState, groupBys),
    getActor: dispatch => createActor(name, dispatch, groupBys),
    onSave: () => console.log('onSave Event'),
    onRestore: () => console.log('onRestore Event'),
  };
}
