/* eslint-disable no-console */

import { POPULATE, INSERT, UPDATE, DELETE, REPLACE } from '../types';
import _reduce from '../_reducePayload';

const populate = (state, action) => {
  return action.payload.reduce((res, record) => {
    res.allIds.push(record.id);
    res.byId[record.id] = record;
    return res;
  }, {
    allIds: [],
    byId: {},
  });
};

const insert = (state, action) => {
  const byId = state ? Object.assign({}, state.byId) : {};
  const allIds = state ? state.allIds.slice() : [];

  function insertOne(record) {
    if (byId[record.id]) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Insert record with id ${record.id} when it already exists on schema ${action.schema}`);
      }
      return false;
    }

    allIds.push(record.id);
    byId[record.id] = record;
    return true;
  }

  if (_reduce(action.payload, insertOne)) {
    return {
      allIds,
      byId,
    };
  }

  return state;
};

const update = (state, action) => {
  if (!state) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Trying to update schema ${action.schema} which isn't initialized`);
    }
    return state;
  }

  const byId = Object.assign({}, state.byId);
  function updateOne(record) {
    if (!byId[record.id]) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Trying to update schema ${action.schema} with record id ${record.id} which doesn't exists`);
      }
      return false;
    }

    byId[record.id] = Object.assign({}, byId[record.id], record);
    return true;
  }

  if (_reduce(action.payload, updateOne)) {
    return {
      allIds: state.allIds,
      byId,
    };
  }

  return state;
};

const remove = (state, action) => {
  if (!state) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Trying to delete a record from schema ${action.schema} which hasn't been initialized`);
    }
    return state;
  }

  const byId = Object.assign({}, state.byId);
  const allIds = state.allIds.slice();
  function removeOne(id) {
    if (!byId[id]) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Trying to delete a record from schame ${action.schema} with id ${id} which doesn't exist`);
      }
      return false;
    }
    const idx = allIds.indexOf(id);
    allIds.splice(idx, 1);
    delete byId[id];
    return true;
  }

  if (_reduce(action.payload, removeOne)) {
    return {
      byId,
      allIds,
    };
  }

  return state;
};

const replace = (state, action) => {
  if (!state) {
    return insert(state, action);
  }

  const newIds = [];
  const byId = Object.assign({}, state.byId);

  function replaceOne(record) {
    if (!byId[record.id]) {
      newIds.push(record.id);
    }
    byId[record.id] = record;
    return true;
  }

  _reduce(action.payload, replaceOne);

  return {
    allIds: newIds.length === 0 ? state.allIds : state.allIds.concat(newIds),
    byId,
  };
};

const reducers = {
  [POPULATE]: populate,
  [INSERT]: insert,
  [UPDATE]: update,
  [DELETE]: remove,
  [REPLACE]: replace,
};

export function getAll(state) {
  return state.allIds.map(id => state.byId[id]);
}

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

export function actionCreator(schema) {
  return {
    populate: records => ({ type: POPULATE, schema, payload: records }),
    insert: record => ({ type: INSERT, schema, payload: record }),
    update: record => ({ type: UPDATE, schema, payload: record }),
    delete: id => ({ type: DELETE, schema, payload: id }),
    replace: record => ({ type: REPLACE, schema, payload: record }),
  };
}

export function actor(schema, dispatch) {
  const actions = actionCreator(schema);
  const res = {};
  Object.keys(actions).forEach((key) => {
    const actionFn = actions[key];
    res[key] = arg => dispatch(actionFn(arg));
  });

  return res;
}

export function reducer(state = null, action) {
  const actionReducer = reducers[action.type];
  if (!actionReducer) {
    console.warn(`Unknown action ${action.type} trying to execute on schema ${action.schema}`);
    return state;
  }

  return actionReducer(state, action);
}
