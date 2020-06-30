import { POPULATE, INSERT, DELETE } from '../types';
import { getAll } from '../normalized';
import _reducePayload from '../_reducePayload';

function createInitialState(version) {
  const initialState = {
    version,
    values: [],
    byValue: {},
  };

  return initialState;
}


export default class GroupBy {
  constructor(name, definition) {
    if (process.env.NODE_ENV === 'development') {
      // validate the groupBy definition
      if (!definition.version || typeof definition.version !== 'number') {
        throw new Error(`GroupBy definition for ${name} doesn't have valid version number`);
      }

      if (!definition.index) {
        throw new Error(`GroupBy definition for ${name} doesn't have a index field or method`);
      }
    }

    this.name = name;
    this.index = typeof definition.index === 'string'
      ? record => record[definition.index]
      : definition.index;

    this.version = definition.version;

    this.definition = definition;

    // Get the aggregations from the definitions
    this.aggrs = [];
    const reducers = {
      [POPULATE]: this.createPopulate(),
      [INSERT]: this.createInsert(),
      [DELETE]: this.createDelete(),
    };

    this.reducer = (state, action) => {
      const reducer = reducers[action.type];
      if (!reducer) {
        console.log(`TODO: No reducer found for ${action.type} in groupBy. I really need to implement this fast.`);
        return state;
      }

      return reducer(state, action);
    };
  }

  onRestore(state, rootState) {
    // While restoring resort to populating entire structure
    // if the version has changed
    if (state && state.version && state.version >= this.version) {
      return state;
    }

    return rootState ? this.generate(getAll(rootState)) : createInitialState(this.version);
  }

  generate(records) {
    const newState = createInitialState(this.version);
    records.forEach((record) => {
      const value = this.index(record) || null;

      let valueInfo = newState.byValue[value];
      if (!valueInfo) {
        valueInfo = {
          ids: [record.id],
        };
        newState.byValue[value] = valueInfo;
        newState.values.push(value);
      } else {
        valueInfo.ids.push(record.id);
      }

      this.aggrs.forEach((aggr) => {
        valueInfo[aggr.name] = aggr.calc(valueInfo[aggr.name], record);
      });
    });
    return newState;
  }

  selector(getState) {
    return this.aggrs.reduce((res, aggr) => {
      res[aggr.name] = (value) => {
        const state = getState();
        const byValue = state && state.byValue[value];
        return byValue && byValue[aggr.name];
      };
      return res;
    }, {
      uniques: () => {
        const state = getState();
        return state && state.values;
      },
      getIds: (value) => {
        const state = getState();
        const byValue = state && state.byValue[value];
        return byValue && byValue.ids;
      },
    });
  }

  createPopulate() {
    return (state, action) => {
      const records = action.payload;
      return this.generate(records);
    };
  }

  // TODO: An inefficient delete op has been implemented. Need to replace it with an efficient one
  // eslint-disable-next-line
  createDelete() {
    return (state, action) => {
      const id = action.payload;
      // Find out the value corresponding to this record id
      const values = Object.keys(state.byValue);
      for (let i = 0; i < values.length; i += 1) {
        const value = values[i];
        const valueInfo = state.byValue[value];
        const idx = valueInfo.ids.indexOf(id);
        if (idx >= 0) {
          const newState = Object.assign({}, state);
          if (valueInfo.ids.length === 1) {
            // When removing the last one, remove from the entire value as well
            delete newState.byValue[value];
            newState.values = newState.values.filter(v => v !== value);
          } else {
            newState.byValue = {
              ...newState.byValue,
              [value]: {
                ids: valueInfo.ids.filter(d => d !== id),
              },
            };
          }
          return newState;
        }
      }
      return state;
    };
  }

  createInsert() {
    return (state, action) => {
      const newState = state ? Object.assign({}, state) : createInitialState(this.version);
      const insertOne = (record) => {
        const value = this.index(record);

        let valueInfo = newState.byValue[value];
        if (!valueInfo) {
          valueInfo = {
            ids: [record.id],
          };
          newState.values = newState.values.concat(value);
          newState.byValue[value] = valueInfo;
        } else {
          valueInfo.ids = valueInfo.ids.concat(record.id);
        }

        this.aggrs.forEach((aggr) => {
          const prev = valueInfo[aggr.name];
          valueInfo[aggr.name] = aggr.calc(prev, record);
        });

        return true;
      };

      _reducePayload(action.payload, insertOne);

      return newState;
    };
  }

  getReducer() {
    return this.reducer;
  }
}
