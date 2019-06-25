/* global __DEV__ */
/* eslint-disable no-console */

import { POPULATE, INSERT, UPDATE, DELETE, UPSERT, REPLACE } from '../types';

const populate = (state, action) => {
  return action.payload.reduce((res, record) => {
    res.allIds.push(record.id);
    res.byId[record.id] = record;
    return res;
  }, {
    allids: [],
    byId: {},
  });
};

const insert = (state, action) => {
  const record = action.payload;
  if (!state) {
    return {
      allIds: [record.id],
      byId: { [record.id]: record },
    };
  }

  if (__DEV__) {
    if (state.byId[record.id]) {
      console.warn(`Insert record with id ${record.id} when it already exists on schema ${action.schema}`);
    }
  }

  return {
    allIds: state.allIds.concat(record.id),
    byId: {
      ...state.byId,
      [record.id]: record,
    },
  };
};

const update = (state, action) => {
  const record = action.payload;
  if (!state || !state.byId[record.id]) {
    if (__DEV__) {
      console.warn(`Trying to update schema ${action.schema} with record id ${record.id} which doesn't exist`);
    }
    return state;
  }

  return {
    allIds: state.allIds,
    byId: {
      ...state.byId,
      [record.id]: {
        ...state.byId[record.id],
        ...record,
      },
    },
  };
};

const remove = (state, action) => {
  const id = action.payload;
  if (!state || !state.byId[id]) {
    if (__DEV__) {
      console.warn(`Trying to delete a record from schema ${action.schema} with id ${id} which doesn't exist`);
      return state;
    }
  }

  const clone = Object.assign({}, state.byId);
  delete clone[id];
  return {
    allIds: state.allIds.filter(rid => rid !== id),
    byId: clone,
  };
};

const replace = (state, action) => {
  const record = action.payload;
  if (!state || !state.byId[record.id]) {
    return insert(state, action);
  }

  return {
    allIds: state.allIds,
    byId: {
      ...state.byId,
      [record.id]: record,
    },
  };
};

const upsert = (state, action) => {
  const record = action.payload;
  if (!state || !state.byId[record.id]) {
    return insert(state, action);
  }

  return update(state, action);
};

const reducers = {
  [POPULATE]: populate,
  [INSERT]: insert,
  [UPDATE]: update,
  [DELETE]: remove,
  [REPLACE]: replace,
  [UPSERT]: upsert,
};

export function selector(getState) {
  return {
    allIds: () => {
      const state = getState();
      return state && state.allIds;
    },
    get: (id) => {
      const state = getState();
      return state && state.byId[id];
    },
    length: () => {
      const state = getState();
      return state && state.allIds.length;
    },
  };
}

export function actor(schema, dispatch) {
  return {
    populate: records => dispatch({ type: POPULATE, schema, payload: records }),
    insert: record => dispatch({ type: INSERT, schema, payload: record }),
    update: record => dispatch({ type: UPDATE, schema, payload: record }),
    delete: id => dispatch({ type: DELETE, schema, payload: id }),
    replace: record => dispatch({ type: REPLACE, schema, payload: record }),
    upsert: record => dispatch({ type: UPSERT, schema, payload: record }),
  };
}

export function reducer(state = null, action) {
  const actionReducer = reducers[action.type];
  if (!actionReducer) {
    console.warn(`Unknown action ${action.type} trying to execute on schema ${action.schema}`);
    return state;
  }

  return actionReducer(state, action);
}
