import { POPULATE } from '../types';

function createInitialState() {
  const initialState = {
    values: [],
    byValue: {},
  };

  return initialState;
}


export default class GroupBy {
  constructor(name, definition) {
    this.name = name;
    this.definition = definition;

    // Get the aggregations from the definitions
    this.aggrs = [];
    const reducers = {
      [POPULATE]: this.createPopulate(),
    };

    this.reducer = (state, action) => {
      const reducer = reducers[action.type];
      if (!reducer) return state;
      return reducer(state, action);
    };
  }

  createPopulate() {
    return (state, action) => {
      const records = action.payload;
      const newState = createInitialState();

      records.forEach((record) => {
        const value = this.getValue(record);

        let valueInfo = newState.byValue[value];
        if (!valueInfo) {
          valueInfo = {
            ids: [record.id],
          };
          newState.byValue[value] = valueInfo;
          newState.values.push(value);
        }

        valueInfo.ids.push(record.id);
        this.aggrs.forEach((aggr) => {
          valueInfo[aggr.name] = aggr.calc(valueInfo[aggr.name], record);
        });
      });
    };
  }

  // createInsert() {
  //   return (state, action) => {
  //     const record = action.payload;
  //     const value = this.getValue(record);

  //     const newState = state ? Object.assign({}, state) : {
  //       values: [value],
  //       byValue: {
  //         [value]: {
  //           ids: [record.id],
  //         },
  //       },
  //     };

  //     this.aggrs.forEach((aggr) => {
  //       const valueInfo = newState.byValue[value];
  //       const prev = valueInfo[aggr.name];
  //       valueInfo[aggr.name] = aggr.calc(prev, record);
  //     });
  //     return newState;
  //   };
  // }

  getReducer() {
    return this.reducer;
  }
}

